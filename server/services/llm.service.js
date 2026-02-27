/**
 * LLM Service — GPT-4o Double Streaming
 *
 * Architecture:
 *   User transcript
 *       ↓
 *   FSM (governs state) → goal + context
 *       ↓
 *   PromptLibrary → system message
 *       ↓
 *   GPT-4o streaming (token by token)
 *       ↓ (sentence complete)
 *   ElevenLabs TTS (binary audio chunks → WS client)
 *
 * The LLM CANNOT change FSM state. Only the FSM can do that.
 * The AbortSignal kills both the LLM stream and TTS stream simultaneously.
 *
 * Returns: { fullText: string, sentenceCount: number, firstTokenMs: number }
 */

import OpenAI from "openai";
import { streamAudioToWebSocket } from "./elevenlabs.service.js";

// ─── OpenAI client (lazy singleton) ──────────────────────────────────────
let _client = null;

const getClient = () => {
    if (!_client) {
        if (!process.env.OPENAI_API_KEY) {
            throw new Error("OPENAI_API_KEY is not set in .env");
        }
        _client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    }
    return _client;
};

// ─── Models ───────────────────────────────────────────────────────────────
const LLM_MODEL = process.env.OPENAI_MODEL ?? "gpt-4o-mini"; // gpt-4o for max quality

// ─── Sentence boundary detection ─────────────────────────────────────────

/** Regex that matches end-of-sentence punctuation. */
const SENTENCE_END = /[.!?]+(?:\s|$)/;

const OFFTRACK_TAG_RE = /\[OFFTRACK=(true|false)\]/i;

/**
 * Flush complete sentences out of a text buffer.
 *
 * @param {string} buffer — Accumulated token text so far.
 * @returns {{ sentences: string[], remainder: string }}
 */
function extractSentences(buffer) {
    const sentences = [];
    let remainder = buffer;

    while (true) {
        const match = SENTENCE_END.exec(remainder);
        if (!match) break;

        const end = match.index + match[0].length;
        const sentence = remainder.slice(0, end).trim();
        if (sentence) sentences.push(sentence);
        remainder = remainder.slice(end);
    }

    return { sentences, remainder };
}

// ─── Double-stream pipeline ───────────────────────────────────────────────

/**
 * streamLLMAndAudio
 *
 * Streams GPT-4o tokens, flushes completed sentences to ElevenLabs TTS,
 * and pipes binary audio chunks to the WebSocket client — all in real time.
 *
 * Flow:
 *   1. Opens an OpenAI streaming chat completion
 *   2. As tokens arrive, accumulates them in a buffer
 *   3. When a complete sentence is detected:
 *      a. Sends a `llm_sentence` JSON frame to the client (UI text update)
 *      b. Calls streamAudioToWebSocket for that sentence (TTS binary stream)
 *   4. After stream ends, flushes any remaining buffer as a final sentence
 *   5. Returns { fullText, sentenceCount, firstTokenMs }
 *
 * Both the LLM HTTP request and TTS streams are cancelled when the
 * AbortSignal fires (barge-in or timeout).
 *
 * @param {Array}           messages      — OpenAI messages array from buildMessages()
 * @param {number}          maxTokens     — Max tokens for this state
 * @param {import("ws")}    ws            — Live WebSocket client
 * @param {AbortSignal}     signal        — Shared cancellation token
 * @param {object}          options
 * @param {number}          options.sequenceId   — Pipeline sequence ID
 * @param {Function}        options.onSentence   — Optional callback for each sentence
 * @returns {Promise<{ fullText: string, sentenceCount: number, firstTokenMs: number }>}
 */
export const streamLLMAndAudio = async (messages, maxTokens, ws, signal, options = {}) => {
    const { sequenceId, onSentence, onOffTrack } = options;
    const client = getClient();

    if (signal?.aborted) return { fullText: "", sentenceCount: 0, firstTokenMs: -1 };

    const requestStart = Date.now();
    let firstTokenMs = -1;
    let buffer = "";
    let fullText = "";
    let sentenceCount = 0;
    let offTrack = null;

    const send = (data) => {
        if (ws.readyState === ws.OPEN) {
            ws.send(JSON.stringify(data));
        }
    };

    // ── Open OpenAI streaming completion ──────────────────────────────────
    const stream = await client.chat.completions.create({
        model: LLM_MODEL,
        messages,
        max_tokens: maxTokens ?? 80,
        temperature: 0.7,
        stream: true,
    }, { signal }); // AbortSignal passed directly to the OpenAI SDK

    // ── Process streaming tokens ──────────────────────────────────────────
    try {
        for await (const chunk of stream) {
            if (signal?.aborted) break;

            const delta = chunk.choices?.[0]?.delta?.content ?? "";
            if (!delta) continue;

            // Record first token latency
            if (firstTokenMs === -1) {
                firstTokenMs = Date.now() - requestStart;
                console.log(`[LLM] ⚡ First token in ${firstTokenMs}ms | seq: ${sequenceId ?? "?"}`);
            }

            buffer += delta;
            fullText += delta;

            // Detect off-track tag as soon as it appears (don't speak it)
            if (offTrack === null) {
                const m = OFFTRACK_TAG_RE.exec(buffer);
                if (m) {
                    offTrack = m[1].toLowerCase() === "true";
                    onOffTrack?.(offTrack);
                    // Remove the tag from buffers so it never reaches TTS
                    buffer = buffer.replace(OFFTRACK_TAG_RE, "");
                    fullText = fullText.replace(OFFTRACK_TAG_RE, "");
                }
            }

            // ── Flush complete sentences ───────────────────────────────────
            const { sentences, remainder } = extractSentences(buffer);
            buffer = remainder;

            for (const sentence of sentences) {
                if (signal?.aborted) break;

                sentenceCount++;
                console.log(`[LLM] 📝 Sentence ${sentenceCount}: "${sentence}"`);

                // Notify client of the text (for UI transcript display)
                send({
                    type: "llm_sentence",
                    content: sentence,
                    sentenceIndex: sentenceCount,
                    sequenceId,
                });

                onSentence?.(sentence);

                // Stream this sentence as audio immediately
                try {
                    await streamAudioToWebSocket(sentence, ws, signal, { sequenceId });
                } catch (ttsErr) {
                    if (ttsErr.code !== "ERR_CANCELED" && ttsErr.name !== "AbortError") {
                        console.error(`[LLM] TTS error for sentence ${sentenceCount}:`, ttsErr.message);
                    }
                }

                if (signal?.aborted) break;
            }
        }
    } catch (err) {
        // AbortError is expected during barge-in — treat as non-fatal
        if (err.name !== "AbortError" && err.code !== "ERR_CANCELED") {
            throw err;
        }
    }

    // ── Flush remaining buffer (incomplete final sentence) ────────────────
    if (buffer.trim() && !signal?.aborted) {
        const finalSentence = buffer.replace(OFFTRACK_TAG_RE, "").trim();
        sentenceCount++;
        fullText = fullText; // already accumulated

        send({
            type: "llm_sentence",
            content: finalSentence,
            sentenceIndex: sentenceCount,
            isFinal: true,
            sequenceId,
        });

        try {
            // Guard: don't send empty audio if only tag remained
            if (finalSentence) {
                await streamAudioToWebSocket(finalSentence, ws, signal, { sequenceId });
            }
        } catch (ttsErr) {
            if (ttsErr.code !== "ERR_CANCELED" && ttsErr.name !== "AbortError") {
                console.error("[LLM] TTS error for final sentence:", ttsErr.message);
            }
        }
    }

    console.log(
        `[LLM] ✅ Complete | sentences: ${sentenceCount} | tokens≈${fullText.split(" ").length} | firstToken: ${firstTokenMs}ms | seq: ${sequenceId ?? "?"}`
    );

    return { fullText: fullText.replace(OFFTRACK_TAG_RE, "").trim(), sentenceCount, firstTokenMs, offTrack };
};
