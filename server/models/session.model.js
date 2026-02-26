import mongoose from "mongoose";

/**
 * HistoryEntry — a single turn in the conversation.
 */
const historyEntrySchema = new mongoose.Schema(
    {
        role: {
            type: String,
            enum: ["user", "ai"],
            required: true,
        },
        text: {
            type: String,
            required: true,
        },
        state: {
            type: String,
            required: true,
        },
        intent: {
            type: String,
            default: null,
        },
    },
    { _id: false, timestamps: true }
);

/**
 * SessionModel — persists the whole FSM conversation context.
 *
 * Key design decisions:
 *  - `sessionId` is indexed for O(1) look-ups even as the collection grows.
 *  - `currentState` is a string key matching FSM state names.
 *  - `history` is a capped-style subdoc array (trimmed in the service layer).
 *  - `metadata` is a flexible map for caller-supplied data (language, userId…).
 */
const sessionSchema = new mongoose.Schema(
    {
        sessionId: {
            type: String,
            required: true,
            unique: true,
            index: true, // ← Explicit index for fast look-ups
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },
        currentState: {
            type: String,
            default: "IDLE",
        },
        history: {
            type: [historyEntrySchema],
            default: [],
        },
        metadata: {
            type: Map,
            of: mongoose.Schema.Types.Mixed,
            default: {},
        },
        lastActiveAt: {
            type: Date,
            default: Date.now,
            index: true, // Useful for TTL-based cleanup jobs
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

// Auto-update lastActiveAt before every save
sessionSchema.pre("save", function (next) {
    this.lastActiveAt = new Date();
    next();
});

export const Session = mongoose.model("Session", sessionSchema);
