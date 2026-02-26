import { getOrCreateSession, updateSession } from "../services/memory.service.js";
import { detectIntent } from "../services/intent.service.js";
import { VoiceFSM } from "../services/fsm.service.js";
import { textToSpeechBase64 } from "../services/elevenlabs.service.js";

/**
 * POST /api/transcript
 *
 * Input:  { sessionId?: string, transcript: string }
 * Output: { audio: string (base64), text: string, nextState: string, sessionId: string }
 *
 * The controller is intentionally "thin" — it only orchestrates service calls.
 * All business logic lives inside the services.
 *
 * Accepts an optional `signal` (AbortSignal) on the request object for
 * FSM protection: if the signal is aborted mid-pipeline, the state is
 * NOT written to MongoDB, preventing inconsistent "middle" states.
 */
export const handleTranscript = async (req, res, next) => {
    try {
        const { sessionId, transcript } = req.body;
        const signal = req.signal ?? null; // Optional AbortSignal

        // ── Validate input ────────────────────────────────────────────────────
        if (!transcript || typeof transcript !== "string" || !transcript.trim()) {
            return res.status(400).json({
                error: "transcript is required and must be a non-empty string.",
            });
        }

        // ── 1. Memory — retrieve or create session ────────────────────────────
        const session = await getOrCreateSession(sessionId);

        // ── 2. Intent — classify the user's text ─────────────────────────────
        const intent = detectIntent(transcript.trim(), session.currentState);
        console.log(
            `[${session.sessionId}] State: ${session.currentState} | Intent: ${intent}`
        );

        // ── 3. FSM — determine next state and response text ───────────────────
        const fsm = new VoiceFSM(session.currentState);
        const { nextState, responseText, responseKey } = fsm.transition(intent);

        // ── Abort check: bail before expensive TTS call ───────────────────────
        if (signal?.aborted) {
            return res.status(499).json({ error: "Request interrupted." });
        }

        // ── 4. TTS — synthesize the AI response ──────────────────────────────
        const audioBase64 = await textToSpeechBase64(responseText);

        // ── Abort check: skip DB write if interrupted (FSM Protection) ────────
        if (signal?.aborted) {
            console.log(`[Controller] Aborted before DB write — state NOT updated.`);
            return res.status(499).json({ error: "Request interrupted." });
        }

        // ── 5. Memory — persist history and advance state ─────────────────────
        await updateSession(session, transcript, responseText, intent, nextState);

        // ── 6. Respond ────────────────────────────────────────────────────────
        return res.status(200).json({
            sessionId: session.sessionId,
            text: responseText,
            audio: audioBase64,
            nextState,
            intent,
            responseKey,
        });
    } catch (error) {
        next(error); // Pass to global error handler
    }
};

/**
 * GET /api/session/:sessionId
 * Returns the current session state and recent history (for debugging/UI).
 */
export const getSession = async (req, res, next) => {
    try {
        const session = await getOrCreateSession(req.params.sessionId);
        return res.status(200).json({
            sessionId: session.sessionId,
            currentState: session.currentState,
            history: session.history.slice(-20),
            lastActiveAt: session.lastActiveAt,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * DELETE /api/session/:sessionId
 * Resets a session to the IDLE state (soft reset — keeps the document).
 */
export const resetSession = async (req, res, next) => {
    try {
        const session = await getOrCreateSession(req.params.sessionId);
        session.currentState = "IDLE";
        session.history = [];
        await session.save();
        return res.status(200).json({ message: "Session reset.", sessionId: session.sessionId });
    } catch (error) {
        next(error);
    }
};
