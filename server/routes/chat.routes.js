import { Router } from "express";
import {
    handleTranscript,
    getSession,
    resetSession,
} from "../controllers/chat.controller.js";

const router = Router();

/**
 * POST /api/transcript
 * Main voice pipeline entry point.
 * Body: { sessionId?: string, transcript: string }
 */
router.post("/transcript", handleTranscript);

/**
 * GET /api/session/:sessionId
 * Inspect the current session state and history.
 */
router.get("/session/:sessionId", getSession);

/**
 * DELETE /api/session/:sessionId
 * Soft-reset a session back to IDLE.
 */
router.delete("/session/:sessionId", resetSession);

export default router;
