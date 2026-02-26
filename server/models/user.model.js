import mongoose from "mongoose";

/**
 * UserModel — lightweight profile store.
 * Primarily used for linking sessions to a named participant.
 */
const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            trim: true,
            default: "Anonymous",
        },
        email: {
            type: String,
            trim: true,
            lowercase: true,
            sparse: true, // allow null but enforce uniqueness when present
            unique: true,
        },
        metadata: {
            type: Map,
            of: mongoose.Schema.Types.Mixed,
            default: {},
        },
    },
    {
        timestamps: true, // createdAt, updatedAt
        versionKey: false,
    }
);

export const User = mongoose.model("User", userSchema);
