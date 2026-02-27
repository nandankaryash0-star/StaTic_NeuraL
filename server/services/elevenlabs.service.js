import axios from "axios";

const BASE_URL = "https://api.elevenlabs.io/v1";

// ─── Constants ─────────────────────────────────────────────────────────────

/**
 * eleven_turbo_v2_5  — ElevenLabs' fastest, lowest-latency model.
 * Falls back to the env var ELEVENLABS_MODEL_ID for easy override.
 */
const TURBO_MODEL = process.env.ELEVENLABS_MODEL_ID ?? "eleven_turbo_v2_5";

/**
 * optimize_streaming_latency: 4 is the maximum ElevenLabs setting.
 * Sacrifices some quality for the lowest possible first-byte latency.
 */
const STREAM_LATENCY_OPT = 4;

/** Shared voice settings — tweak via env for per-deployment tuning. */
const VOICE_SETTINGS = {
    stability: parseFloat(process.env.ELEVENLABS_STABILITY ?? "0.45"),
    similarity_boost: parseFloat(process.env.ELEVENLABS_SIMILARITY ?? "0.75"),
    style: parseFloat(process.env.ELEVENLABS_STYLE ?? "0.2"),
    use_speaker_boost: true,
};

// ─── Helpers ───────────────────────────────────────────────────────────────

const getHeaders = () => ({
    "xi-api-key": process.env.ELEVENLABS_API_KEY,
    "Content-Type": "application/json",
});

const requireApiKey = () => {
    if (!process.env.ELEVENLABS_API_KEY) {
        throw new Error("ELEVENLABS_API_KEY is not set.");
    }
};

// ─── REST / Base64 TTS (used by the REST controller) ──────────────────────

/**
 * Convert text to speech and return a Base64-encoded audio string.
 * Used by the REST POST /api/transcript endpoint.
 *
 * @param {string} text     — Text to synthesize.
 * @param {string} [voiceId]
 * @returns {Promise<string>} — Base64-encoded MP3 audio.
 */
export const textToSpeechBase64 = async (text, voiceId) => {
    requireApiKey();
    const voice = voiceId ?? process.env.ELEVENLABS_VOICE_ID;

    const response = await axios.post(
        `${BASE_URL}/text-to-speech/${voice}?optimize_streaming_latency=${STREAM_LATENCY_OPT}`,
        { text, model_id: TURBO_MODEL, voice_settings: VOICE_SETTINGS },
        {
            headers: getHeaders(),
            responseType: "arraybuffer",
            timeout: 15000,
        }
    );

    return Buffer.from(response.data).toString("base64");
};

// ─── Express Stream (used by REST streaming endpoint) ─────────────────────

/**
 * Stream TTS audio directly to an Express response object.
 * Lower latency than Base64 — browser starts playing before the full buffer
 * arrives.
 *
 * @param {string}                text
 * @param {import("express").Response} res
 * @param {string}                [voiceId]
 */
export const streamAudioToResponse = async (text, res, voiceId) => {
    requireApiKey();
    const voice = voiceId ?? process.env.ELEVENLABS_VOICE_ID;

    const response = await axios.post(
        `${BASE_URL}/text-to-speech/${voice}/stream?optimize_streaming_latency=${STREAM_LATENCY_OPT}`,
        { text, model_id: TURBO_MODEL, voice_settings: VOICE_SETTINGS },
        {
            headers: getHeaders(),
            responseType: "stream",
            timeout: 30000,
        }
    );

    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Transfer-Encoding", "chunked");
    res.setHeader("X-Content-Type-Options", "nosniff");
    response.data.pipe(res);

    return new Promise((resolve, reject) => {
        response.data.on("end", resolve);
        response.data.on("error", reject);
    });
};

// ─── WebSocket Binary Chunked Stream (primary real-time path) ─────────────

/**
 * streamAudioToWebSocket
 *
 * The ultra-low-latency path.
 *
 * Protocol:
 *   1. Before any binary data is sent, a JSON metadata frame is sent:
 *        { type: "audio_meta", responseText, model, sequenceId }
 *   2. Each raw MP3 chunk from ElevenLabs is forwarded as a binary WS frame.
 *      No buffering — first byte is sent the moment it arrives.
 *   3. Callers handle EOS signalling (audio_end JSON frame) after this resolves.
 *
 * @param {string}        text        — Text to synthesize.
 * @param {import("ws")}  ws          — Live WebSocket client.
 * @param {AbortSignal}   [signal]    — Cancel token for barge-in / timeout.
 * @param {object}        [options]
 * @param {string}        [options.voiceId]    — Override default voice.
 * @param {number}        [options.sequenceId] — Pipeline sequence ID (for UI sync).
 * @returns {Promise<{ firstByteMs: number, totalChunks: number }>}
 */
export const streamAudioToWebSocket = async (text, ws, signal, options = {}) => {
    requireApiKey();

    const { voiceId, sequenceId } = options;
    const voice = voiceId ?? process.env.ELEVENLABS_VOICE_ID;
    const requestStart = Date.now();

    // ── 1. Kick off the streaming request ─────────────────────────────────
    const response = await axios.post(
        `${BASE_URL}/text-to-speech/${voice}/stream?optimize_streaming_latency=${STREAM_LATENCY_OPT}`,
        { text, model_id: TURBO_MODEL, voice_settings: VOICE_SETTINGS },
        {
            headers: getHeaders(),
            responseType: "stream",
            timeout: 30000,
            signal, // Passed directly to Axios — aborts the HTTP request
        }
    );

    const stream = response.data;

    return new Promise((resolve, reject) => {
        let firstByteMs = -1;
        let totalChunks = 0;
        let metaSent = false;

        // ── Abort handler ──────────────────────────────────────────────────
        const onAbort = () => {
            stream.destroy();
            resolve({ firstByteMs, totalChunks }); // Graceful — caller checks signal.aborted
        };

        if (signal) {
            if (signal.aborted) {
                stream.destroy();
                return resolve({ firstByteMs: -1, totalChunks: 0 });
            }
            signal.addEventListener("abort", onAbort, { once: true });
        }

        // ── Data handler — zero buffering ──────────────────────────────────
        stream.on("data", (chunk) => {
            if (ws.readyState !== ws.OPEN) {
                stream.destroy();
                return;
            }

            // Send JSON metadata exactly once, just before the first audio byte
            if (!metaSent) {
                metaSent = true;
                firstByteMs = Date.now() - requestStart;
                ws.send(
                    JSON.stringify({
                        type: "audio_meta",
                        responseText: text,
                        model: TURBO_MODEL,
                        sequenceId,
                        firstByteMs,
                    })
                );
                console.log(
                    `[ElevenLabs] 🎵 First byte in ${firstByteMs}ms | seq: ${sequenceId ?? "?"}`
                );
            }

            // Forward the raw binary chunk immediately
            ws.send(chunk, { binary: true });
            totalChunks++;
        });

        // ── Stream end ─────────────────────────────────────────────────────
        stream.on("end", () => {
            signal?.removeEventListener("abort", onAbort);
            console.log(
                `[ElevenLabs] ✅ Stream complete | chunks: ${totalChunks} | seq: ${sequenceId ?? "?"}`
            );
            resolve({ firstByteMs, totalChunks });
        });

        // ── Stream error ───────────────────────────────────────────────────
        stream.on("error", (err) => {
            signal?.removeEventListener("abort", onAbort);
            // Cancelled / aborted streams are non-fatal
            if (axios.isCancel(err) || err.code === "ERR_CANCELED" || err.name === "AbortError") {
                resolve({ firstByteMs, totalChunks });
            } else {
                reject(err);
            }
        });
    });
};

// ─── Utility ───────────────────────────────────────────────────────────────

/**
 * Fetch available voices from ElevenLabs.
 */
export const listVoices = async () => {
    requireApiKey();
    const response = await axios.get(`${BASE_URL}/voices`, { headers: getHeaders() });
    return response.data.voices;
};
