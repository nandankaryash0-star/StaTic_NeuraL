import mongoose from "mongoose";

/**
 * Establishes a connection to MongoDB using the URI from environment variables.
 * Logs success or throws on failure so the server can exit early.
 */
export const connectDB = async () => {
    const uri = process.env.MONGODB_URI;

    if (!uri) {
        throw new Error("MONGODB_URI is not set in environment variables.");
    }

    try {
        await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 5000,
        });
        console.log(`✅ MongoDB connected: ${mongoose.connection.host}`);
    } catch (error) {
        console.error("❌ MongoDB connection failed:", error.message);
        throw error; // Let server.js handle exit
    }
};
