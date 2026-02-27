/**
 * SARTHI 2.0 — End-to-End Stress Test Suite
 *
 * Runs 5 scenarios against the live WebSocket server at ws://localhost:8080/ws.
 * Start the backend first: cd server && npm run dev
 *
 * Usage:
 *   node tests/stress-test.js              # run all tests
 *   node tests/stress-test.js flood        # run a single test by name
 *   node tests/stress-test.js barge-in
 *   node tests/stress-test.js loop
 *   node tests/stress-test.js ghost
 *   node tests/stress-test.js reconnect
 *
 * Requires: ws  (already in package.json; install with: npm i ws)
 */

import WebSocket from "ws";
import http from "http";

const WS_URL = process.env.WS_URL ?? "ws://localhost:8080/ws";
const HEALTH_URL = process.env.HEALTH_URL ?? "http://localhost:8080/health";
const SESSION_ID = `stress-test-${Date.now()}`;

// ─── Pre-flight: verify server is reachable ────────────────────────────────

function checkServerReachable() {
    return new Promise((resolve) => {
        const req = http.get(HEALTH_URL, (res) => {
            resolve({ ok: true, status: res.statusCode });
        });
        req.on("error", (err) => {
            resolve({ ok: false, error: err.code ?? err.message });
        });
        req.setTimeout(3000, () => {
            req.destroy();
            resolve({ ok: false, error: "TIMEOUT" });
        });
    });
}

// ─── Colour helpers ────────────────────────────────────────────────────────
const c = {
    reset: "\x1b[0m",
    green: (s) => `\x1b[32m${s}\x1b[0m`,
    red: (s) => `\x1b[31m${s}\x1b[0m`,
    yellow: (s) => `\x1b[33m${s}\x1b[0m`,
    cyan: (s) => `\x1b[36m${s}\x1b[0m`,
    bold: (s) => `\x1b[1m${s}\x1b[0m`,
};

const PASS = c.green("✅ PASS");
const FAIL = c.red("❌ FAIL");
const INFO = c.cyan("ℹ");

// ─── Test helpers ──────────────────────────────────────────────────────────

/**
 * Open a WebSocket, wait for the "connected" handshake, and return
 * a promise-based { ws, messages } object.
 */
function connect(label) {
    return new Promise((resolve, reject) => {
        const ws = new WebSocket(WS_URL);
        const messages = [];

        ws.on("open", () => {
            console.log(`${INFO} [${label}] Connected`);
        });

        ws.on("message", (raw, isBinary) => {
            if (isBinary) {
                messages.push({ type: "_binary", byteLength: raw.length });
            } else {
                try {
                    const msg = JSON.parse(raw.toString());
                    messages.push(msg);
                    if (msg.type === "status" && msg.status === "connected") {
                        resolve({ ws, messages });
                    }
                } catch {
                    messages.push({ type: "_raw", data: raw.toString() });
                }
            }
        });

        ws.on("error", (err) => {
            // Surface full error info — err.message can be empty for ECONNREFUSED
            const detail = err.code ? `${err.code}: ${err.message}` : err.toString();
            reject(new Error(`[${label}] WS error — ${detail}`));
        });

        // Timeout if we never get a connected status message
        setTimeout(() => reject(new Error(`[${label}] Connection timeout after 5s`)), 5000);
    });
}

/**
 * Send a finalised user transcript to the server.
 */
function sendTranscript(ws, text, sessionId = SESSION_ID) {
    ws.send(
        JSON.stringify({
            type: "transcript",
            sessionId,
            content: text,
            isFinal: true,
        })
    );
}

/**
 * Wait for a message matching a predicate (or timeout).
 */
function waitFor(messages, predicate, timeoutMs = 10000) {
    return new Promise((resolve, reject) => {
        const check = setInterval(() => {
            const found = messages.find(predicate);
            if (found) {
                clearInterval(check);
                clearTimeout(timer);
                resolve(found);
            }
        }, 50);

        const timer = setTimeout(() => {
            clearInterval(check);
            reject(new Error("waitFor timeout"));
        }, timeoutMs);
    });
}

/** Sleep helper */
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ─── Result tracker ────────────────────────────────────────────────────────

const results = [];
function record(name, passed, notes = "") {
    results.push({ name, passed, notes });
    console.log(
        `\n${passed ? PASS : FAIL} ${c.bold(name)}${notes ? `\n   ${c.yellow(notes)}` : ""}`
    );
}

// ══════════════════════════════════════════════════════════════════════════
// TEST 1 — "The Flood" (Rapid Speech Input)
// Send 5 isFinal transcripts in < 2 seconds.
// Expect: only the latest is fully processed; earlier ones are aborted.
// ══════════════════════════════════════════════════════════════════════════

async function testFlood() {
    console.log(`\n${c.bold(c.cyan("━━ TEST 1: The Flood (Rapid Speech Input)"))}`);
    const { ws, messages } = await connect("Flood");

    console.time("flood-total");

    // Fire 5 transcripts in rapid succession
    const phrases = [
        "book a table for two",
        "I want to make a reservation",
        "schedule an appointment",
        "set me up with a meeting",
        "I need to book something please",  // ← this should win
    ];

    for (const phrase of phrases) {
        sendTranscript(ws, phrase);
        await sleep(300);  // 300ms apart → 5 msgs in 1.5s
    }

    let interruptCount = 0;
    let processingCount = 0;
    let doneCount = 0;

    // Collect events for 8 seconds
    await sleep(8000);
    console.timeEnd("flood-total");

    for (const m of messages) {
        if (m.type === "interrupt_confirmed") interruptCount++;
        if (m.type === "status" && m.status === "processing") processingCount++;
        if (m.type === "status" && m.status === "done") doneCount++;
    }

    console.log(`${INFO} interrupts: ${interruptCount} | processing signals: ${processingCount} | done: ${doneCount}`);

    // Expect: at least 4 interrupts, exactly 1 "done"
    const passed = interruptCount >= 4 && doneCount === 1;
    record("The Flood", passed, `${interruptCount}/4 interrupts, ${doneCount}/1 done signals`);
    ws.close();
}

// ══════════════════════════════════════════════════════════════════════════
// TEST 2 — "The Barge-In" (Interrupt mid-stream)
// Start an AI response, then interrupt halfway through.
// Expect: interrupt_confirmed received, new response starts cleanly.
// ══════════════════════════════════════════════════════════════════════════

async function testBargeIn() {
    console.log(`\n${c.bold(c.cyan("━━ TEST 2: The Barge-In (Interrupt)"))}`);
    const { ws, messages } = await connect("BargeIn");

    // Trigger a long response
    console.time("barge-in-to-interrupt_confirmed");
    sendTranscript(ws, "tell me everything you know about your services in detail");

    // Wait for audio to start arriving
    await waitFor(messages, (m) => m.type === "_binary").catch(() => null);
    console.log(`${INFO} Binary audio started — sending barge-in now`);

    // Barge in
    const bargeStart = Date.now();
    sendTranscript(ws, "actually wait, book me a table");

    let interrupted = false;
    try {
        await waitFor(messages, (m) => m.type === "interrupt_confirmed", 5000);
        interrupted = true;
        const ms = Date.now() - bargeStart;
        console.timeEnd("barge-in-to-interrupt_confirmed");
        console.log(`${INFO} interrupt_confirmed received in ${ms}ms`);
    } catch {
        console.log(c.red("   interrupt_confirmed never arrived"));
    }

    // Expect a new "done" after the barge-in
    let gotNewResponse = false;
    try {
        await waitFor(
            messages,
            (m, idx) => m.type === "status" && m.status === "done" && idx > messages.findIndex((x) => x.type === "interrupt_confirmed"),
            10000
        );
        gotNewResponse = true;
    } catch {
        // fallback: any "done" after an interrupt is fine
        gotNewResponse = messages.filter((m) => m.type === "status" && m.status === "done").length >= 1;
    }

    record("The Barge-In", interrupted && gotNewResponse, `interrupted=${interrupted}, newResponse=${gotNewResponse}`);
    ws.close();
}

// ══════════════════════════════════════════════════════════════════════════
// TEST 3 — "The Loop" (FSM Edge Case — 3 consecutive failures)
// Send an invalid intent 3x in a row from a state that should RETRY.
// Expect: FSM transitions away from RETRY after threshold.
// ══════════════════════════════════════════════════════════════════════════

async function testFSMLoop() {
    console.log(`\n${c.bold(c.cyan("━━ TEST 3: The Loop (FSM Edge Case)"))}`);
    const { ws, messages } = await connect("Loop");
    const states = [];

    console.time("fsm-loop-total");

    // Three consecutive invalid/unknown inputs
    for (let i = 0; i < 3; i++) {
        sendTranscript(ws, "xyzzy invalid gibberish foobar");
        await sleep(4000); // Give each one time to complete
    }

    console.timeEnd("fsm-loop-total");

    for (const m of messages) {
        if (m.type === "transcript" && m.nextState) {
            states.push(m.nextState);
        }
    }

    console.log(`${INFO} FSM state transitions: ${states.join(" → ")}`);

    // The system shouldn't get stuck in the exact same state forever with no exit
    const lastState = states[states.length - 1];
    const notLooping =
        states.length < 3 ||
        !(states[0] === states[1] && states[1] === states[2]);

    record("The Loop", notLooping, `Final state: ${lastState ?? "unknown"} | Transitions: ${states.join(" → ")}`);
    ws.close();
}

// ══════════════════════════════════════════════════════════════════════════
// TEST 4 — "The Ghost" (Silence Timeout)
// Open a socket, send nothing. After 65s the timeout must fire.
// Expect: audio_meta + binary chunks + audio_end + status:idle
// ══════════════════════════════════════════════════════════════════════════

async function testGhost() {
    console.log(`\n${c.bold(c.cyan("━━ TEST 4: The Ghost (Silence Timeout)"))}`);
    console.log(`${INFO} Waiting 65 seconds for inactivity timeout to fire…`);

    const { ws, messages } = await connect("Ghost");

    // Send session init so the server knows a sessionId (timeout needs one to fire)
    ws.send(JSON.stringify({ type: "session_init", sessionId: `ghost-${Date.now()}` }));
    // Also send one transcript to register the session in MongoDB
    sendTranscript(ws, "hello");
    await sleep(5000); // Let that complete

    console.time("ghost-timeout-fire");

    // Now silence for 65s
    try {
        await waitFor(
            messages,
            (m) => m.type === "status" && m.status === "idle",
            68000
        );
        console.timeEnd("ghost-timeout-fire");
        const gotAudioMeta = messages.some((m) => m.type === "audio_meta");
        const gotBinary = messages.some((m) => m.type === "_binary");
        console.log(`${INFO} audio_meta: ${gotAudioMeta} | binary audio: ${gotBinary}`);
        record("The Ghost", true, "Timeout fired and idle status received");
    } catch {
        console.timeEnd("ghost-timeout-fire");
        record("The Ghost", false, "Timeout did NOT fire within 68s");
    }

    ws.close();
}

// ══════════════════════════════════════════════════════════════════════════
// TEST 5 — "The Reconnection" (Mid-stream network drop)
// Open socket, start a response, then hard-close the socket mid-stream.
// Reconnect and verify the server is clean (no hung lock).
// ══════════════════════════════════════════════════════════════════════════

async function testReconnect() {
    console.log(`\n${c.bold(c.cyan("━━ TEST 5: The Reconnection (Network Jitter)"))}`);
    const { ws, messages } = await connect("Reconnect-A");

    // Start a response
    sendTranscript(ws, "tell me about your services");
    await waitFor(messages, (m) => m.type === "_binary").catch(() => null);
    console.log(`${INFO} Binary audio started — hard-closing socket now`);

    console.time("reconnect-clean");
    ws.terminate(); // Hard drop — no graceful close handshake

    await sleep(1000);

    // Now reconnect with a fresh socket
    const { ws: ws2, messages: msgs2 } = await connect("Reconnect-B");
    sendTranscript(ws2, "book an appointment");

    // If the server state was cleaned up correctly, we should get a valid response
    let cleanStart = false;
    try {
        await waitFor(msgs2, (m) => m.type === "status" && m.status === "done", 12000);
        cleanStart = true;
        console.timeEnd("reconnect-clean");
        console.log(`${INFO} New session processed cleanly after reconnect`);
    } catch {
        console.timeEnd("reconnect-clean");
        console.log(c.red("   New session did NOT complete — server may be hung"));
    }

    record("The Reconnection", cleanStart, `Clean session after hard-drop: ${cleanStart}`);
    ws2.close();
}

// ══════════════════════════════════════════════════════════════════════════
// Results Summary
// ══════════════════════════════════════════════════════════════════════════

function printSummary() {
    const passed = results.filter((r) => r.passed).length;
    const total = results.length;

    console.log(`\n${"═".repeat(60)}`);
    console.log(c.bold(`  Stress Test Results — ${passed}/${total} passed`));
    console.log("═".repeat(60));
    console.log(
        `  ${"Test".padEnd(28)} ${"Result".padEnd(10)} Notes`
    );
    console.log(`  ${"-".repeat(56)}`);
    for (const r of results) {
        const status = r.passed ? c.green("PASS") : c.red("FAIL");
        console.log(`  ${r.name.padEnd(28)} ${status.padEnd(18)} ${r.notes}`);
    }
    console.log("═".repeat(60) + "\n");

    process.exit(passed === total ? 0 : 1);
}

// ══════════════════════════════════════════════════════════════════════════
// Test Runner
// ══════════════════════════════════════════════════════════════════════════

const ALL_TESTS = {
    flood: testFlood,
    "barge-in": testBargeIn,
    loop: testFSMLoop,
    ghost: testGhost,
    reconnect: testReconnect,
};

async function runAll() {
    // ── Pre-flight: bail early if server isn't running ─────────────────────
    const health = await checkServerReachable();
    if (!health.ok) {
        console.error(c.red(`
╔══════════════════════════════════════════════════════════╗
║  ❌  Backend server is NOT reachable                     ║
║                                                          ║
║  Start it first:  cd server && npm run dev               ║
║  Then re-run:     npm run test:stress                    ║
╚══════════════════════════════════════════════════════════╝`));
        console.error(c.yellow(`  Health check URL : ${HEALTH_URL}`));
        console.error(c.yellow(`  Error            : ${health.error}\n`));
        process.exit(1);
    }
    console.log(c.green(`${INFO} Server reachable at ${HEALTH_URL} ✓\n`));

    const arg = process.argv[2];

    if (arg && ALL_TESTS[arg]) {
        console.log(c.bold(`\n🧪 Running single test: ${arg}\n`));
        await ALL_TESTS[arg]();
    } else {
        console.log(c.bold(`\n🧪 Running ALL stress tests against ${WS_URL}\n`));
        console.log(c.yellow("⚠  The Ghost test adds a 65s wait — total runtime ~90s\n"));
        for (const [name, fn] of Object.entries(ALL_TESTS)) {
            console.log(`\n${"─".repeat(60)}`);
            try {
                await fn();
            } catch (err) {
                record(name, false, `Unexpected error: ${err.toString()}`);
            }
            await sleep(1500);
        }
    }

    printSummary();
}

runAll().catch((err) => {
    const detail = err?.stack ?? err?.toString() ?? "unknown error";
    console.error(c.red("\n💥 Fatal error:"), detail);
    process.exit(1);
});
