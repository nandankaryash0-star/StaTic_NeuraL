import { Session } from "../models/session.model.js";
import { v4 as uuidv4 } from "uuid";

// Maximum conversation history turns to persist per session
const MAX_HISTORY_TURNS = 50;

/**
 * Retrieves an existing session from MongoDB, or creates a new one.
 *
 * @param {string|null} sessionId — If null/undefined, a new UUID is generated.
 * @returns {Promise<Session>}
 */
export const getOrCreateSession = async (sessionId) => {
    if (!sessionId) {
        return await Session.create({ sessionId: uuidv4() });
    }

    const session = await Session.findOne({ sessionId });

    if (!session) {
        // Client passed a stale/unknown ID — create a fresh session with that ID
        return await Session.create({ sessionId });
    }

    return session;
};

/**
 * Appends a user turn and an AI turn to the session history,
 * then updates the FSM state.
 *
 * @param {Session} session — Mongoose document (not a plain object)
 * @param {string} userText
 * @param {string} aiText
 * @param {string} intent
 * @param {string} nextState
 * @returns {Promise<Session>} — Updated session document
 */
export const updateSession = async (
    session,
    userText,
    aiText,
    intent,
    nextState
) => {
    const prevState = session.currentState;

    // Append user turn
    session.history.push({
        role: "user",
        text: userText,
        state: prevState,
        intent,
    });

    // Append AI turn
    session.history.push({
        role: "ai",
        text: aiText,
        state: nextState,
        intent: null,
    });

    // Trim history to cap storage growth
    if (session.history.length > MAX_HISTORY_TURNS * 2) {
        session.history = session.history.slice(-MAX_HISTORY_TURNS * 2);
    }

    session.currentState = nextState;

    await session.save();
    return session;
};

/**
 * Returns only the last N turns of the conversation as a plain array.
 * Useful for building LLM context windows.
 *
 * @param {Session} session
 * @param {number} limit
 */
export const getRecentHistory = (session, limit = 10) => {
    return session.history.slice(-limit * 2);
};
