/**
 * FSM Service — Finite State Machine
 *
 * Defines all conversational states, the legal transitions between them,
 * and the canned response text (responseKey) to send back to the user.
 *
 * Architecture:
 *  - `STATES` — master list of valid state identifiers.
 *  - `RESPONSES` — response text keyed by a response ID.
 *  - `TRANSITIONS` — nested map: currentState → intent → { nextState, responseKey }.
 *  - `VoiceFSM` class — the public interface, keeps state pristine.
 *
 * Adding a new state:
 *  1. Add it to `STATES`.
 *  2. Add response text to `RESPONSES`.
 *  3. Add transition rules to `TRANSITIONS`.
 */

import { getPromptForState } from "./prompt-library.service.js";

// ─── State Registry ────────────────────────────────────────────────────────
export const STATES = {
    IDLE: "IDLE",
    ONBOARDING: "ONBOARDING",
    BOOKING: "BOOKING",
    CONFIRMATION: "CONFIRMATION",
    FAQ: "FAQ",
    FAREWELL: "FAREWELL",
    ERROR: "ERROR",
};

// ─── Response Library ──────────────────────────────────────────────────────
export const RESPONSES = {
    WELCOME:
        "Hello! I'm SARTHI 2.0, your voice assistant. You can book an appointment, get information, or ask for help. How can I help you today?",

    ASK_NAME:
        "Great, let's get you set up. Could you tell me your name?",

    NAME_RECEIVED:
        "Nice to meet you! What would you like to do today — book an appointment, get information, or something else?",

    ASK_DATE:
        "I'd be happy to help book that. What date works for you?",

    ASK_TIME:
        "Perfect! And what time would you prefer?",

    CONFIRM_BOOKING:
        "Let me confirm: you'd like to book an appointment. Does that sound right?",

    BOOKING_CONFIRMED:
        "Wonderful! Your appointment has been booked. Is there anything else I can help you with?",

    BOOKING_CANCELLED:
        "No problem! The booking has been cancelled. How else can I assist you?",

    PROVIDE_INFO:
        "I'll do my best to help with that. What specific information are you looking for?",

    FAQ_RESPONSE:
        "That's a great question! Here is some information about that topic. Would you like to know anything else?",

    GOODBYE:
        "Thank you for talking with me. Have a wonderful day! Goodbye!",

    HELP:
        "Of course! Here's what I can do: book appointments, answer questions, or provide information. What would you like?",

    REPEAT:
        "Sure, let me repeat that for you.",

    FALLBACK:
        "I'm sorry, I didn't quite catch that. Could you rephrase or say it again?",

    ERROR:
        "I've encountered an issue. Let's start fresh — how can I help you today?",
};

// ─── Transition Table ──────────────────────────────────────────────────────
// Structure: TRANSITIONS[currentState][intent] = { nextState, responseKey }
const TRANSITIONS = {
    [STATES.IDLE]: {
        GREETING: { nextState: STATES.ONBOARDING, responseKey: "ASK_NAME" },
        START_BOOKING: { nextState: STATES.BOOKING, responseKey: "ASK_DATE" },
        INQUIRY: { nextState: STATES.FAQ, responseKey: "PROVIDE_INFO" },
        COMPLAINT: { nextState: STATES.FAQ, responseKey: "PROVIDE_INFO" },
        HELP: { nextState: STATES.IDLE, responseKey: "HELP" },
        AFFIRM: { nextState: STATES.ONBOARDING, responseKey: "ASK_NAME" },
        UNKNOWN: { nextState: STATES.IDLE, responseKey: "WELCOME" },
    },
    [STATES.ONBOARDING]: {
        PROVIDE_NAME: { nextState: STATES.IDLE, responseKey: "NAME_RECEIVED" },
        SKIP_NAME: { nextState: STATES.IDLE, responseKey: "NAME_RECEIVED" },
        START_BOOKING: { nextState: STATES.BOOKING, responseKey: "ASK_DATE" },
        UNKNOWN: { nextState: STATES.ONBOARDING, responseKey: "ASK_NAME" },
    },
    [STATES.BOOKING]: {
        PROVIDE_DATE: { nextState: STATES.BOOKING, responseKey: "ASK_TIME" },
        PROVIDE_TIME: { nextState: STATES.CONFIRMATION, responseKey: "CONFIRM_BOOKING" },
        DENY: { nextState: STATES.IDLE, responseKey: "BOOKING_CANCELLED" },
        GOODBYE: { nextState: STATES.FAREWELL, responseKey: "GOODBYE" },
        UNKNOWN: { nextState: STATES.BOOKING, responseKey: "ASK_DATE" },
    },
    [STATES.CONFIRMATION]: {
        CONFIRM: { nextState: STATES.IDLE, responseKey: "BOOKING_CONFIRMED" },
        AFFIRM: { nextState: STATES.IDLE, responseKey: "BOOKING_CONFIRMED" },
        CANCEL: { nextState: STATES.IDLE, responseKey: "BOOKING_CANCELLED" },
        DENY: { nextState: STATES.IDLE, responseKey: "BOOKING_CANCELLED" },
        UNKNOWN: { nextState: STATES.CONFIRMATION, responseKey: "CONFIRM_BOOKING" },
    },
    [STATES.FAQ]: {
        NEXT_QUESTION: { nextState: STATES.FAQ, responseKey: "FAQ_RESPONSE" },
        DONE_FAQ: { nextState: STATES.IDLE, responseKey: "HELP" },
        START_BOOKING: { nextState: STATES.BOOKING, responseKey: "ASK_DATE" },
        GOODBYE: { nextState: STATES.FAREWELL, responseKey: "GOODBYE" },
        UNKNOWN: { nextState: STATES.FAQ, responseKey: "FAQ_RESPONSE" },
    },
    [STATES.FAREWELL]: {
        // Terminal state — any input loops back to IDLE
        GREETING: { nextState: STATES.IDLE, responseKey: "WELCOME" },
        UNKNOWN: { nextState: STATES.IDLE, responseKey: "WELCOME" },
    },
    [STATES.ERROR]: {
        UNKNOWN: { nextState: STATES.IDLE, responseKey: "ERROR" },
    },
};

// Global fallbacks for any state (lowest priority)
const GLOBAL_FALLBACKS = {
    GOODBYE: { nextState: STATES.FAREWELL, responseKey: "GOODBYE" },
    HELP: { nextState: STATES.IDLE, responseKey: "HELP" },
    REPEAT: { nextState: null, responseKey: "REPEAT" }, // stay in place
};

// ─── FSM Class ─────────────────────────────────────────────────────────────

export class VoiceFSM {
    /**
     * @param {string} currentState — Current FSM state from session.
     */
    constructor(currentState = STATES.IDLE) {
        if (!Object.values(STATES).includes(currentState)) {
            console.warn(`[FSM] Unknown state "${currentState}", defaulting to IDLE.`);
            this.currentState = STATES.IDLE;
        } else {
            this.currentState = currentState;
        }
    }

    /**
     * Process an intent and return the transition result.
     *
     * @param {string} intent — Intent label from intent.service.js
     * @returns {{
     *   nextState:    string,
     *   responseText: string,   // Canned fallback (used by REST endpoint)
     *   responseKey:  string,
     *   goal:         string,   // LLM instruction for this next state
     * }}
     */
    transition(intent) {
        const stateMap = TRANSITIONS[this.currentState] ?? {};

        // 1. State-specific rule
        let rule = stateMap[intent];

        // 2. Global fallback (GOODBYE, HELP, REPEAT work from any state)
        if (!rule) {
            rule = GLOBAL_FALLBACKS[intent];
        }

        // 3. State-level UNKNOWN catch-all
        if (!rule) {
            rule = stateMap["UNKNOWN"];
        }

        // 4. Hard fallback — should never reach this
        if (!rule) {
            rule = { nextState: STATES.IDLE, responseKey: "FALLBACK" };
        }

        const nextState = rule.nextState ?? this.currentState; // REPEAT keeps current
        const responseText = RESPONSES[rule.responseKey] ?? RESPONSES.FALLBACK;
        const { goal } = getPromptForState(nextState);

        return {
            nextState,
            responseKey: rule.responseKey,
            responseText, // Kept for REST controller backward compat
            goal, // LLM constraint for the next state
        };
    }
}
