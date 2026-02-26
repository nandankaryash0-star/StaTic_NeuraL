import axios from "axios";

const BASE_URL = "https://api.elevenlabs.io/v1";

/**
 * ElevenLabs Service
 *
 * Converts text to speech via the ElevenLabs TTS API.
 * Returns a Base64-encoded audio string for easy JSON transport to the frontend.
 *
 * For ultra-low latency, see `streamAudio()` which pipes the response
 * stream directly to an Express response object.
 */

const getHeaders = () => ({
    "xi-api-key": process.env.ELEVENLABS_API_KEY,
    "Content-Type": "application/json",
});

/**
 * Convert text to speech and return a Base64-encoded audio string.
 *
 * @param {string} text — The text to synthesize.
 * @param {string} [voiceId] — ElevenLabs voice ID. Defaults to env var.
 * @returns {Promise<string>} — Base64-encoded MP3 audio.
 */
export const textToSpeechBase64 = async (text, voiceId) => {
    const voice = voiceId ?? process.env.ELEVENLABS_VOICE_ID;

    if (!process.env.ELEVENLABS_API_KEY) {
        throw new Error("ELEVENLABS_API_KEY is not set.");
    }

    const response = await axios.post(
        `${BASE_URL}/text-to-speech/${voice}`,
        {
            text,
            model_id: "eleven_turbo_v2",   // Lowest latency model
            voice_settings: {
                stability: 0.5,
                similarity_boost: 0.75,
                style: 0.3,
                use_speaker_boost: true,
            },
        },
        {
            headers: getHeaders(),
            responseType: "arraybuffer",    // Raw binary for accurate Base64 encoding
            timeout: 15000,
        }
    );

    const base64Audio = Buffer.from(response.data).toString("base64");
    return base64Audio;
};

/**
 * Stream TTS audio directly to an Express response.
 * Use this for lower latency — the browser can start playing
 * audio before the full response is received.
 *
 * @param {string} text
 * @param {import("express").Response} res — Express response object
 * @param {string} [voiceId]
 */
export const streamAudioToResponse = async (text, res, voiceId) => {
    const voice = voiceId ?? process.env.ELEVENLABS_VOICE_ID;

    if (!process.env.ELEVENLABS_API_KEY) {
        throw new Error("ELEVENLABS_API_KEY is not set.");
    }

    const response = await axios.post(
        `${BASE_URL}/text-to-speech/${voice}/stream`,
        {
            text,
            model_id: "eleven_turbo_v2",
            voice_settings: {
                stability: 0.5,
                similarity_boost: 0.75,
                style: 0.3,
                use_speaker_boost: true,
            },
        },
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

/**
 * Stream TTS audio directly to a WebSocket client as binary frames.
 *
 * This is the lowest-latency path: the first chunk of audio is forwarded
 * to the browser the moment it arrives from ElevenLabs — zero buffering.
 *
 * @param {string}        text        — Text to synthesize.
 * @param {import("ws")}  ws          — WebSocket client instance.
 * @param {AbortSignal}   [signal]    — Optional AbortSignal for interruption.
 * @param {string}        [voiceId]   — ElevenLabs voice ID override.
 * @returns {Promise<void>} — Resolves when stream ends or is aborted.
 */
export const streamAudioToWebSocket = async (text, ws, signal, voiceId) => {
    const voice = voiceId ?? process.env.ELEVENLABS_VOICE_ID;

    if (!process.env.ELEVENLABS_API_KEY) {
        throw new Error("ELEVENLABS_API_KEY is not set.");
    }

    const response = await axios.post(
        `${BASE_URL}/text-to-speech/${voice}/stream`,
        {
            text,
            model_id: "eleven_turbo_v2",
            voice_settings: {
                stability: 0.5,
                similarity_boost: 0.75,
                style: 0.3,
                use_speaker_boost: true,
            },
        },
        {
            headers: getHeaders(),
            responseType: "stream",
            timeout: 30000,
            signal, // Axios natively supports AbortSignal
        }
    );

    const stream = response.data;

    return new Promise((resolve, reject) => {
        // If the signal fires mid-stream, destroy immediately
        const onAbort = () => {
            stream.destroy();
            resolve(); // Resolve gracefully — the caller handles abort semantics
        };

        if (signal) {
            if (signal.aborted) {
                stream.destroy();
                return resolve();
            }
            signal.addEventListener("abort", onAbort, { once: true });
        }

        stream.on("data", (chunk) => {
            // Only send if the socket is still open
            if (ws.readyState === ws.OPEN) {
                ws.send(chunk, { binary: true });
            }
        });

        stream.on("end", () => {
            signal?.removeEventListener("abort", onAbort);
            resolve();
        });

        stream.on("error", (err) => {
            signal?.removeEventListener("abort", onAbort);
            // Cancelled streams throw CancelledError — treat as non-fatal
            if (axios.isCancel(err) || err.code === "ERR_CANCELED") {
                resolve();
            } else {
                reject(err);
            }
        });
    });
};

/**
 * Fetch available voices from ElevenLabs.
 * Useful for voice picker UIs.
 */
export const listVoices = async () => {
    const response = await axios.get(`${BASE_URL}/voices`, {
        headers: getHeaders(),
    });
    return response.data.voices;
};
