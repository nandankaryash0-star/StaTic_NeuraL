/**
 * Intent Service — Weighted Scoring Engine
 *
 * Replaces simple regex matching with a multi-signal scoring pipeline:
 *   1. Keyword weights     — each keyword carries a numeric point value
 *   2. Exact phrase boost  — full phrase match adds a large bonus (+5)
 *   3. MIN_THRESHOLD       — intents below the threshold return UNKNOWN_INTENT
 *   4. Contextual tiebreak — ties are broken by preferring the intent most
 *                            relevant to the current FSM state
 *
 * The intent map is fully data-driven — extend INTENT_MAP freely without
 * touching the engine functions at the bottom of this file.
 *
 * Returns: { intent: string, confidence: number, matches: string[] }
 * Sub-5ms — fully synchronous, no I/O.
 */

// ─── Configuration ─────────────────────────────────────────────────────────

/** Minimum score required to accept an intent. */
const MIN_THRESHOLD = 2;

/** Bonus added when an exact phrase is found in the transcript. */
const PHRASE_BOOST = 5;

/**
 * INTENT_MAP
 *
 * Each entry defines:
 *   - keywords: Record<string, number>  — keyword → weight
 *   - phrases:  string[]                — exact phrases that trigger a boost
 *   - states:   string[]                — FSM states where this intent is prioritised
 *
 * Weights guide:
 *   1 = common/ambiguous  (e.g., "hi", "ok")
 *   2 = moderate signal   (e.g., "book", "help")
 *   3 = strong signal     (e.g., "appointment", "cancel")
 *   4 = very strong       (e.g., rare but highly specific terms)
 */
const INTENT_MAP = {
    GREETING: {
        keywords: { hi: 1, hello: 2, hey: 1, howdy: 2, greetings: 2, "good morning": 2, "good afternoon": 2 },
        phrases: ["hi there", "hello there", "hey there", "good morning", "good afternoon"],
        states: ["IDLE"],
    },
    GOODBYE: {
        keywords: { bye: 2, goodbye: 3, exit: 2, quit: 2, end: 1, stop: 1, "see you": 2, farewell: 3, later: 1 },
        phrases: ["goodbye", "see you later", "take care", "have a good day"],
        states: ["FAREWELL", "IDLE"],
    },
    HELP: {
        keywords: { help: 2, assist: 2, support: 2, guide: 2, "how do i": 3, "what can": 2 },
        phrases: ["i need help", "can you help", "how do i", "i need assistance"],
        states: ["IDLE", "FAQ"],
    },
    AFFIRM: {
        keywords: { yes: 1, yeah: 1, sure: 1, ok: 1, okay: 1, correct: 2, absolutely: 2, yep: 1, definitely: 2, confirm: 2, proceed: 2 },
        phrases: ["yes please", "that's correct", "go ahead", "sounds good", "that's right"],
        states: ["CONFIRMATION"],
    },
    DENY: {
        keywords: { no: 1, nope: 1, nah: 1, not: 1, cancel: 2, negative: 2, "don't": 1, stop: 1, abort: 3 },
        phrases: ["no thanks", "never mind", "not really", "cancel that", "forget it"],
        states: ["CONFIRMATION"],
    },
    REPEAT: {
        keywords: { repeat: 3, again: 2, pardon: 2, "say again": 3, "didn't hear": 3, what: 1, huh: 1 },
        phrases: ["say that again", "can you repeat", "didn't catch that", "i didn't hear"],
        states: [],
    },
    START_BOOKING: {
        keywords: { book: 2, reserve: 2, appointment: 3, schedule: 2, "set up": 2, "make a": 1, slot: 2, "want to": 1 },
        phrases: ["make an appointment", "book a slot", "schedule a meeting", "set up an appointment", "i want to book"],
        states: ["IDLE"],
    },
    INQUIRY: {
        keywords: { info: 2, information: 2, "tell me": 2, "know about": 3, question: 2, ask: 1, wondering: 2, curious: 2, how: 1, what: 1 },
        phrases: ["i have a question", "tell me about", "i want to know", "i was wondering"],
        states: ["IDLE", "FAQ"],
    },
    COMPLAINT: {
        keywords: { complaint: 3, issue: 2, problem: 2, wrong: 2, broken: 3, unhappy: 3, frustrated: 3, terrible: 3, bad: 1, error: 2 },
        phrases: ["not working", "this is wrong", "i have an issue", "not happy", "i'm frustrated"],
        states: ["IDLE"],
    },
    PROVIDE_NAME: {
        keywords: { "my name is": 4, "call me": 4, "i am": 2, "i'm": 1, name: 1 },
        phrases: ["my name is", "call me", "you can call me"],
        states: ["ONBOARDING"],
    },
    SKIP_NAME: {
        keywords: { skip: 3, anonymous: 3, "no name": 4, later: 1, prefer: 1 },
        phrases: ["skip that", "prefer not to say", "remain anonymous", "skip for now"],
        states: ["ONBOARDING"],
    },
    PROVIDE_DATE: {
        keywords: { today: 3, tomorrow: 3, monday: 3, tuesday: 3, wednesday: 3, thursday: 3, friday: 3, saturday: 3, sunday: 3, next: 2, this: 1 },
        phrases: ["this monday", "next week", "this friday"],
        states: ["BOOKING"],
    },
    PROVIDE_TIME: {
        keywords: { time: 2, morning: 2, afternoon: 2, evening: 2, noon: 2, midnight: 2, am: 1, pm: 1, "o'clock": 2, hour: 1 },
        phrases: ["in the morning", "in the afternoon", "at noon", "what time"],
        states: ["BOOKING"],
    },
    CONFIRM: {
        keywords: { confirm: 3, "that's right": 3, correct: 2, proceed: 2, "go ahead": 2, finalize: 3, approve: 3 },
        phrases: ["that's right", "go ahead", "yes confirm", "please confirm"],
        states: ["CONFIRMATION"],
    },
    CANCEL: {
        keywords: { cancel: 3, "never mind": 3, abort: 4, stop: 2, "don't want": 3, "changed my mind": 4 },
        phrases: ["cancel that", "never mind", "i changed my mind", "don't book it"],
        states: ["CONFIRMATION", "BOOKING"],
    },
    NEXT_QUESTION: {
        keywords: { next: 2, another: 2, more: 1, else: 1, other: 1, continue: 2 },
        phrases: ["what else", "next question", "another one"],
        states: ["FAQ"],
    },
    DONE_FAQ: {
        keywords: { done: 3, finished: 3, "that's all": 3, "no more": 3, enough: 3, thanks: 1, thank: 1 },
        phrases: ["that's all", "no more questions", "i'm done", "that's enough"],
        states: ["FAQ"],
    },
};

// ─── Normaliser ────────────────────────────────────────────────────────────

/**
 * Normalise a transcript to lowercase with punctuation removed.
 * @param {string} text
 * @returns {string}
 */
const normalise = (text) =>
    text
        .toLowerCase()
        .replace(/[^\w\s']/g, " ")   // Remove punctuation (keep apostrophes)
        .replace(/\s+/g, " ")        // Collapse whitespace
        .trim();

// ─── Scoring Engine ────────────────────────────────────────────────────────

/**
 * Score a single intent against the normalised transcript.
 *
 * @param {string}   normalised  The normalised transcript.
 * @param {object}   intentDef   The intent definition from INTENT_MAP.
 * @returns {{ score: number, matches: string[] }}
 */
const scoreIntent = (normalised, intentDef) => {
    const { keywords = {}, phrases = [] } = intentDef;
    let score = 0;
    const matches = [];

    // ── Exact phrase matching (high priority boost) ───────────────────────
    for (const phrase of phrases) {
        if (normalised.includes(phrase.toLowerCase())) {
            score += PHRASE_BOOST;
            matches.push(`phrase:"${phrase}"`);
        }
    }

    // ── Keyword weight matching ───────────────────────────────────────────
    for (const [keyword, weight] of Object.entries(keywords)) {
        // Whole-word boundary check using a RegExp for multi-word keywords too
        const pattern = new RegExp(`(?<![\\w])${keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?![\\w])`, "i");
        if (pattern.test(normalised)) {
            score += weight;
            matches.push(`kw:"${keyword}"(+${weight})`);
        }
    }

    return { score, matches };
};

// ─── Contextual Tiebreaker ─────────────────────────────────────────────────

/**
 * Given multiple intents with the same max score, prefer the one
 * that is listed in the current FSM state's priority list.
 *
 * @param {Array<{ intent: string, score: number, matches: string[] }>} tied
 * @param {string} currentState
 * @returns {{ intent: string, score: number, matches: string[] }}
 */
const contextualTiebreak = (tied, currentState) => {
    // Find the first tied intent whose `states` array includes the current FSM state
    const preferred = tied.find(
        ({ intent }) => (INTENT_MAP[intent]?.states ?? []).includes(currentState)
    );
    return preferred ?? tied[0];
};

// ─── Public API ────────────────────────────────────────────────────────────

/**
 * Classify a user transcript using the weighted scoring engine.
 *
 * @param {string} transcript   — Raw user speech text.
 * @param {string} currentState — Current FSM state (e.g., "IDLE").
 * @param {object} [options]
 * @param {boolean} [options.debug=false] — Log scoring breakdown to console.
 * @returns {{ intent: string, confidence: number, matches: string[] }}
 */
export const detectIntent = (transcript, currentState, { debug = false } = {}) => {
    const normalised = normalise(transcript);
    const scores = [];

    for (const [intentName, intentDef] of Object.entries(INTENT_MAP)) {
        const { score, matches } = scoreIntent(normalised, intentDef);
        if (score > 0) {
            scores.push({ intent: intentName, score, matches });
        }
    }

    // Sort by score descending
    scores.sort((a, b) => b.score - a.score);

    if (debug && process.env.NODE_ENV !== "production") {
        console.log(`\n[Intent Debug] "${transcript}" → "${normalised}"`);
        console.table(
            scores.map(({ intent, score, matches }) => ({
                Intent: intent,
                Score: score,
                Matches: matches.join(", "),
            }))
        );
    }

    // ── No match or below threshold ───────────────────────────────────────
    if (scores.length === 0 || scores[0].score < MIN_THRESHOLD) {
        return { intent: "UNKNOWN_INTENT", confidence: 0, matches: [] };
    }

    const topScore = scores[0].score;

    // ── Tiebreak if multiple intents share the top score ─────────────────
    const tied = scores.filter((s) => s.score === topScore);
    const winner = tied.length > 1 ? contextualTiebreak(tied, currentState) : tied[0];

    // ── Confidence: ratio of winner's score to total score pool ──────────
    const totalScore = scores.reduce((sum, s) => sum + s.score, 0);
    const confidence = Math.round((winner.score / totalScore) * 100) / 100;

    return {
        intent: winner.intent,
        confidence,
        matches: winner.matches,
    };
};
