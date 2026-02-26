/**
 * Intent Service
 *
 * Maps a raw user transcript to a discrete, state-aware intent label.
 * This is a rule-based implementation — it can be swapped for an NLP/LLM
 * classification call without changing the rest of the system.
 *
 * Each state can have its own set of keyword patterns, so context matters:
 * saying "yes" in IDLE means something different than "yes" in CONFIRMATION.
 */

// ─── Intent Patterns ───────────────────────────────────────────────────────
// Format: { intent: string, patterns: RegExp[] }
// Ordered from most-specific to least-specific within each group.

const GLOBAL_PATTERNS = [
    { intent: "GREETING", patterns: [/\b(hi|hello|hey|howdy|greetings)\b/i] },
    { intent: "GOODBYE", patterns: [/\b(bye|goodbye|exit|quit|end|stop|see you)\b/i] },
    { intent: "HELP", patterns: [/\b(help|assist|support|guide)\b/i] },
    { intent: "AFFIRM", patterns: [/\b(yes|yeah|sure|ok|okay|correct|absolutely|yep)\b/i] },
    { intent: "DENY", patterns: [/\b(no|nope|nah|not|cancel|negative)\b/i] },
    { intent: "REPEAT", patterns: [/\b(repeat|say again|pardon|what|huh)\b/i] },
];

const STATE_PATTERNS = {
    IDLE: [
        { intent: "START_BOOKING", patterns: [/\b(book|reserve|appointment|schedule)\b/i] },
        { intent: "INQUIRY", patterns: [/\b(info|information|tell me|know about|question)\b/i] },
        { intent: "COMPLAINT", patterns: [/\b(complaint|issue|problem|wrong|broken)\b/i] },
    ],
    ONBOARDING: [
        { intent: "PROVIDE_NAME", patterns: [/\bmy name is\b|\bcall me\b|\bi am\b/i] },
        { intent: "SKIP_NAME", patterns: [/\b(skip|anonymous|no name|later)\b/i] },
    ],
    BOOKING: [
        { intent: "PROVIDE_DATE", patterns: [/\b(today|tomorrow|monday|tuesday|wednesday|thursday|friday|\d{1,2}\/\d{1,2}|\d{1,2}th|\d{1,2}st|\d{1,2}nd)\b/i] },
        { intent: "PROVIDE_TIME", patterns: [/\b(\d{1,2}:\d{2}|\d{1,2}\s*(am|pm)|morning|afternoon|evening|noon)\b/i] },
    ],
    CONFIRMATION: [
        { intent: "CONFIRM", patterns: [/\b(confirm|yes|that's right|correct|proceed|go ahead)\b/i] },
        { intent: "CANCEL", patterns: [/\b(cancel|no|stop|never mind|abort)\b/i] },
    ],
    FAQ: [
        { intent: "NEXT_QUESTION", patterns: [/\b(next|another|more|else|other)\b/i] },
        { intent: "DONE_FAQ", patterns: [/\b(done|finished|that's all|no more|enough)\b/i] },
    ],
};

// ─── Matcher ───────────────────────────────────────────────────────────────

const matchPatterns = (text, patterns) => {
    for (const { intent, patterns: regexps } of patterns) {
        if (regexps.some((re) => re.test(text))) {
            return intent;
        }
    }
    return null;
};

/**
 * Classify a transcript into an intent string.
 *
 * @param {string} transcript  — Raw user speech text.
 * @param {string} currentState — Current FSM state (e.g., "IDLE").
 * @returns {string} — Intent label, e.g., "GREETING" or "UNKNOWN".
 */
export const detectIntent = (transcript, currentState) => {
    const text = transcript.trim();

    // 1. Check state-specific patterns first (higher contextual precision)
    const stateRules = STATE_PATTERNS[currentState] ?? [];
    const stateIntent = matchPatterns(text, stateRules);
    if (stateIntent) return stateIntent;

    // 2. Fall back to global patterns
    const globalIntent = matchPatterns(text, GLOBAL_PATTERNS);
    if (globalIntent) return globalIntent;

    // 3. No match
    return "UNKNOWN";
};
