/**
 * ActiveSessionManager
 *
 * In-memory tracker for live WebSocket sessions.
 * Prevents race conditions by maintaining per-session processing state
 * and provides clean barge-in (interruption) semantics.
 *
 * Key properties per session:
 *  - ws               : The WebSocket instance
 *  - isProcessing     : Whether the pipeline is currently running
 *  - isStreaming       : Whether a binary audio stream is in-flight
 *  - currentAbortController : AbortController for the active TTS/pipeline
 *  - lastSequenceId   : Monotonically increasing ID to detect stale responses
 *  - sessionId        : The MongoDB session ID (set after first pipeline run)
 *  - timeoutTimer     : Node.js Timeout handle for the 60s inactivity timer
 */

class ActiveSessionManager {
    constructor() {
        /** @type {Map<import("ws"), SessionState>} */
        this._sessions = new Map();
    }

    /**
     * Register a new WebSocket connection.
     * @param {import("ws")} ws
     * @returns {SessionState}
     */
    register(ws) {
        const state = {
            ws,
            isProcessing: false,
            isStreaming: false,
            currentAbortController: null,
            lastSequenceId: 0,
            sessionId: null,
            timeoutTimer: null,
        };
        this._sessions.set(ws, state);
        console.log(`[SessionManager] Session registered. Active: ${this._sessions.size}`);
        return state;
    }

    /**
     * Get the session state for a WebSocket connection.
     * @param {import("ws")} ws
     * @returns {SessionState|undefined}
     */
    get(ws) {
        return this._sessions.get(ws);
    }

    /**
     * Remove a WebSocket connection (on close/error).
     * Also aborts any in-flight stream.
     * @param {import("ws")} ws
     */
    unregister(ws) {
        const state = this._sessions.get(ws);
        if (state) {
            this._abortStream(state, "disconnect");
            // Clear inactivity timer — prevents ghost FSM transitions after disconnect
            if (state.timeoutTimer) {
                clearTimeout(state.timeoutTimer);
                state.timeoutTimer = null;
            }
            this._sessions.delete(ws);
        }
        console.log(`[SessionManager] Session unregistered. Active: ${this._sessions.size}`);
    }

    /**
     * Attempt to lock the session for processing.
     * Returns the new AbortController if lock acquired, or null if already locked
     * (which shouldn't happen because we always interrupt first).
     *
     * @param {import("ws")} ws
     * @returns {{ controller: AbortController, sequenceId: number } | null}
     */
    lockForProcessing(ws) {
        const state = this._sessions.get(ws);
        if (!state) return null;

        // If already processing, this is a barge-in — abort first
        if (state.isProcessing) {
            this.interrupt(ws);
        }

        state.isProcessing = true;
        state.lastSequenceId += 1;
        state.currentAbortController = new AbortController();

        console.log(
            `[SessionManager] 🔒 Session Locked | seq: ${state.lastSequenceId} | session: ${state.sessionId ?? "new"}`
        );

        return {
            controller: state.currentAbortController,
            sequenceId: state.lastSequenceId,
        };
    }

    /**
     * Release the processing lock.
     * MUST be called in a `finally` block to prevent permanent lock-out.
     *
     * @param {import("ws")} ws
     * @param {number} sequenceId — Only release if this matches the current sequence
     */
    unlock(ws, sequenceId) {
        const state = this._sessions.get(ws);
        if (!state) return;

        // Only unlock if the sequence matches (prevents stale unlocks)
        if (state.lastSequenceId === sequenceId) {
            state.isProcessing = false;
            state.currentAbortController = null;
            console.log(
                `[SessionManager] 🔓 Session Unlocked | seq: ${sequenceId} | session: ${state.sessionId ?? "unknown"}`
            );
        }
    }

    /**
     * Interrupt the current pipeline (barge-in).
     * Aborts the active stream and resets the processing flag.
     *
     * @param {import("ws")} ws
     * @returns {boolean} — true if something was actually interrupted
     */
    interrupt(ws) {
        const state = this._sessions.get(ws);
        if (!state) return false;

        if (state.isProcessing && state.currentAbortController) {
            console.log(
                `[SessionManager] ⚡ Session Interrupted | seq: ${state.lastSequenceId} | session: ${state.sessionId ?? "unknown"}`
            );
            this._abortStream(state, "barge-in");
            state.isProcessing = false;
            return true;
        }

        return false;
    }

    /**
     * Internal: Abort the active stream.
     * @param {SessionState} state
     * @param {string} reason
     */
    _abortStream(state, reason) {
        if (state.currentAbortController) {
            state.currentAbortController.abort(reason);
            state.currentAbortController = null;
        }
    }

    /** Total active connections. */
    get size() {
        return this._sessions.size;
    }
}

// Singleton — shared across the entire server process
export const sessionManager = new ActiveSessionManager();
