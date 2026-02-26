import "dotenv/config";
import express from "express";
import cors from "cors";
import { WebSocketServer } from "ws";
import { createServer } from "http";

import { connectDB } from "./config/db.js";
import chatRoutes from "./routes/chat.routes.js";
import { getOrCreateSession, updateSession } from "./services/memory.service.js";
import { detectIntent } from "./services/intent.service.js";
import { VoiceFSM } from "./services/fsm.service.js";
import { streamAudioToWebSocket } from "./services/elevenlabs.service.js";
import { sessionManager } from "./services/session-manager.service.js";

const app = express();
const PORT = process.env.PORT || 8080;

// ─── Middleware ────────────────────────────────────────────────────────────

app.use(
    cors({
        origin: process.env.ALLOWED_ORIGIN || "http://localhost:3000",
        methods: ["GET", "POST", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
    })
);

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

// Request logger (dev only)
if (process.env.NODE_ENV !== "production") {
    app.use((req, _res, next) => {
        console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
        next();
    });
}

// ─── Routes ───────────────────────────────────────────────────────────────

app.get("/health", (_req, res) =>
    res.json({ status: "ok", timestamp: new Date().toISOString() })
);

app.use("/api", chatRoutes);

// ─── Global Error Handler ─────────────────────────────────────────────────

// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
    const status = err.status ?? err.statusCode ?? 500;
    const message = err.message ?? "Internal Server Error";

    console.error(`[Error] ${status}: ${message}`, err.stack ?? "");

    res.status(status).json({
        error: {
            message,
            ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
        },
    });
});

// 404 catch-all
app.use((_req, res) => res.status(404).json({ error: "Route not found." }));

// ─── WebSocket Server ─────────────────────────────────────────────────────
// Low-latency voice pipeline with Conversation Stability Layer.
// Uses ActiveSessionManager for session locking, barge-in, and abort.

const httpServer = createServer(app);

const wss = new WebSocketServer({ server: httpServer, path: "/ws" });

wss.on("connection", (ws, req) => {
    const ip = req.socket.remoteAddress;
    console.log(`[WS] Client connected: ${ip}`);

    // ── Register with ActiveSessionManager ───────────────────────────────
    const sessionState = sessionManager.register(ws);

    // ── Helper: safe send ────────────────────────────────────────────────
    const send = (data) => {
        if (ws.readyState === ws.OPEN) {
            ws.send(typeof data === "string" ? data : JSON.stringify(data));
        }
    };

    /**
     * resetInactivityTimer
     *
     * Clears any existing 60s countdown and starts a fresh one.
     * Called on connection-start and on every isFinal transcript.
     * On expiry: FSM → IDLE, soft goodbye TTS piped to the client.
     */
    const INACTIVITY_TIMEOUT_MS = 60_000;
    const GOODBYE_TEXT =
        "I haven't heard from you in a while, so I'll go ahead and take a break. " +
        "Just let me know when you're ready to talk again!";

    const resetInactivityTimer = () => {
        // Clear any existing timer
        if (sessionState.timeoutTimer) {
            clearTimeout(sessionState.timeoutTimer);
            sessionState.timeoutTimer = null;
        }

        sessionState.timeoutTimer = setTimeout(async () => {
            sessionState.timeoutTimer = null;

            // Nothing to do if socket is already gone or no session yet
            if (ws.readyState !== ws.OPEN || !sessionState.sessionId) return;

            console.log(
                `[Timeout] Session ${sessionState.sessionId} moved to IDLE due to inactivity.`
            );

            // ── Interrupt any in-flight processing ────────────────────────
            sessionManager.interrupt(ws);

            // ── Lock for the timeout pipeline ────────────────────────────
            const lock = sessionManager.lockForProcessing(ws);
            if (!lock) return;

            const { controller, sequenceId } = lock;

            try {
                // ── Transition FSM to IDLE in MongoDB ───────────────────
                const session = await getOrCreateSession(sessionState.sessionId);
                await updateSession(session, "<inactivity_timeout>", GOODBYE_TEXT, "TIMEOUT", "IDLE");

                // ── Send text immediately ────────────────────────────────
                send({
                    type: "transcript",
                    role: "ai",
                    content: GOODBYE_TEXT,
                    nextState: "IDLE",
                    intent: "TIMEOUT",
                    sequenceId,
                });

                // ── Abort check before expensive TTS call ────────────────
                if (controller.signal.aborted) return;

                // ── Stream goodbye audio (zero-buffered) ─────────────────
                try {
                    await streamAudioToWebSocket(GOODBYE_TEXT, ws, controller.signal);
                } catch (err) {
                    if (err.code !== "ERR_CANCELED" && err.name !== "AbortError") {
                        console.error("[Timeout] TTS error:", err.message);
                    }
                }

                // ── EOS signal ───────────────────────────────────────────
                if (!controller.signal.aborted) {
                    send({ type: "audio_end", sequenceId });
                    send({ type: "status", status: "idle" });
                }
            } catch (err) {
                // Socket may have closed mid-async — don't crash
                if (ws.readyState === ws.OPEN) {
                    console.error("[Timeout] Inactivity handler error:", err.message);
                }
            } finally {
                // ── Always release the lock ──────────────────────────────
                sessionManager.unlock(ws, sequenceId);
            }
        }, INACTIVITY_TIMEOUT_MS);
    };

    // Start the first countdown immediately on connection
    resetInactivityTimer();

    /**
     * The main voice pipeline (with stability guarantees):
     *
     *  1. Lock session (get AbortController + sequenceId)
     *  2. Memory  → fetch/create session
     *  3. Intent  → classify transcript against current FSM state
     *  4. FSM     → determine next state + response text
     *  5. Send text transcript immediately (minimal latency)
     *  6. [Abort check] — bail if interrupted before audio starts
     *  7. Stream binary audio chunks from ElevenLabs (zero-buffered)
     *  8. Send audio_end EOS signal
     *  9. [Abort check] — skip MongoDB write if interrupted (FSM Protection)
     * 10. Persist state + history to MongoDB
     * 11. Unlock session (always, via `finally`)
     */
    const runPipeline = async (transcript) => {
        // ── Lock ──────────────────────────────────────────────────────────
        const lock = sessionManager.lockForProcessing(ws);
        if (!lock) return;

        const { controller, sequenceId } = lock;
        const signal = controller.signal;
        const startMs = Date.now();

        console.log(`[Pipeline] ▶ Processing Started | seq: ${sequenceId} | "${transcript}"`);

        try {
            // ── 1. Memory ─────────────────────────────────────────────────
            const session = await getOrCreateSession(sessionState.sessionId);
            sessionState.sessionId = session.sessionId;

            // ── 2. Intent ─────────────────────────────────────────────────
            const intent = detectIntent(transcript, session.currentState);
            console.log(
                `[Pipeline] [${session.sessionId}] State: ${session.currentState} → Intent: ${intent}`
            );

            // ── 3. FSM ────────────────────────────────────────────────────
            const fsm = new VoiceFSM(session.currentState);
            const { nextState, responseText, responseKey } = fsm.transition(intent);

            // ── 4. Send text immediately ──────────────────────────────────
            send({
                type: "transcript",
                role: "ai",
                content: responseText,
                nextState,
                intent,
                responseKey,
                sequenceId,
            });

            // ── 5. Abort check before expensive TTS call ──────────────────
            if (signal.aborted) {
                console.log(`[Pipeline] Aborted before TTS | seq: ${sequenceId}`);
                return;
            }

            // ── 6. Stream audio (binary chunks, zero-buffered) ────────────
            const latencyMs = Date.now() - startMs;
            console.log(
                `[Pipeline] [${session.sessionId}] Latency to audio start: ${latencyMs}ms`
            );

            try {
                await streamAudioToWebSocket(responseText, ws, signal);
            } catch (err) {
                if (err.code !== "ERR_CANCELED" && err.name !== "AbortError") {
                    console.error("[Pipeline] TTS stream error:", err.message);
                }
            }

            // ── 7. End-of-stream signal ───────────────────────────────────
            if (!signal.aborted) {
                send({ type: "audio_end", sequenceId });
            }

            // ── 8. FSM Protection — skip DB write if interrupted ──────────
            if (signal.aborted) {
                console.log(
                    `[Pipeline] Aborted before DB write — state NOT updated | seq: ${sequenceId}`
                );
                return;
            }

            // ── 9. Persist to MongoDB ─────────────────────────────────────
            try {
                await updateSession(session, transcript, responseText, intent, nextState);
                console.log(
                    `[Pipeline] State saved: ${session.currentState} → ${nextState} | seq: ${sequenceId}`
                );
            } catch (dbErr) {
                console.error("[Pipeline] Session save error:", dbErr.message);
            }
        } finally {
            // ── ALWAYS unlock — prevents permanent lock-out ───────────────
            sessionManager.unlock(ws, sequenceId);
        }
    };

    // ── Message handler ───────────────────────────────────────────────────
    ws.on("message", async (rawData) => {
        try {
            // Binary frames from the frontend mic (future STT)
            if (Buffer.isBuffer(rawData) && rawData[0] !== 0x7b) {
                return;
            }

            const message = JSON.parse(rawData.toString());

            switch (message.type) {
                // ── Session handshake ──────────────────────────────────────
                case "session_init":
                    sessionState.sessionId = message.sessionId ?? null;
                    console.log(`[WS] Session initialized: ${sessionState.sessionId}`);
                    break;

                // ── Audio chunks from the mic (future STT) ────────────────
                case "audio_start":
                    sessionState.sessionId = message.sessionId ?? sessionState.sessionId;
                    break;

                case "audio":
                case "audio_end":
                    // future: pipe to server-side STT
                    break;

                // ── Transcript from client-side STT ───────────────────────
                case "transcript": {
                    // Only trigger pipeline on finalised text
                    if (!message.isFinal && message.isFinal !== undefined) {
                        break; // Interim — ignore
                    }

                    const text = (message.content ?? message.transcript ?? "").trim();
                    if (!text) break;

                    // ── Reset inactivity timer on every final transcript ───
                    resetInactivityTimer();

                    // ── BARGE-IN: interrupt if currently processing ────────
                    const wasInterrupted = sessionManager.interrupt(ws);
                    if (wasInterrupted) {
                        send({ type: "interrupt_confirmed" });
                    }

                    // Notify client that a new request is processing
                    send({ type: "status", status: "processing" });

                    // Run the full pipeline
                    await runPipeline(text);

                    // Signal done (only if ws is still open and not already interrupted)
                    send({ type: "status", status: "done" });
                    break;
                }

                default:
                    console.warn(`[WS] Unknown message type: ${message.type}`);
            }
        } catch (parseError) {
            console.error("[WS] Handler error:", parseError.message);
            send({ type: "error", message: parseError.message });
        }
    });

    // ── Cleanup on disconnect ─────────────────────────────────────────────
    ws.on("close", () => {
        sessionManager.unregister(ws);
        console.log(`[WS] Client disconnected: ${ip}`);
    });

    ws.on("error", (err) => {
        sessionManager.unregister(ws);
        console.error("[WS] Socket error:", err.message);
    });

    // Greet on connect
    send({ type: "status", status: "connected" });
});

// ─── Start ─────────────────────────────────────────────────────────────────

const start = async () => {
    try {
        await connectDB();
        httpServer.listen(PORT, () => {
            console.log(`\n🚀 Server running on http://localhost:${PORT}`);
            console.log(`🔌 WebSocket ready at ws://localhost:${PORT}/ws`);
            console.log(`📋 Health check: http://localhost:${PORT}/health\n`);
        });
    } catch (err) {
        console.error("❌ Failed to start server:", err.message);
        process.exit(1);
    }
};

start();
