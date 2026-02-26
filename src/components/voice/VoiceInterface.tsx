"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useVoice } from "@/hooks/useVoice";
import { useWebSocket, WebSocketMessage } from "@/hooks/useWebSocket";
import { useAudioPlayback } from "@/hooks/useAudioPlayback";
import MicButton from "./MicButton";
import StatusIndicator, { BotStatus } from "./StatusIndicator";
import LiveTranscript, { TranscriptEntry } from "./LiveTranscript";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8080/ws";

/**
 * Main Voice Interface — live, continuous conversation.
 *
 * When the user taps the orb, the mic turns on and stays on,
 * streaming audio in real-time. The backend is expected to send
 * transcripts and audio chunks as the conversation progresses.
 * The mic stays active until the user taps again.
 */
export default function VoiceInterface() {
    const [status, setStatus] = useState<BotStatus>("idle");
    const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
    const statusRef = useRef(status);

    useEffect(() => {
        statusRef.current = status;
    }, [status]);

    // ── Audio Playback ──
    const { isPlaying, enqueueAudio, stopPlayback } = useAudioPlayback();

    // ── WebSocket ──
    const handleWsMessage = useCallback(
        (message: WebSocketMessage) => {
            switch (message.type) {
                case "transcript":
                    if (message.content) {
                        setTranscript((prev) => [
                            ...prev,
                            {
                                id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
                                role: message.role || "ai",
                                text: message.content!,
                                timestamp: new Date(),
                            },
                        ]);
                        // If AI sent a transcript while listening, keep listening status
                        if (message.role === "ai" && statusRef.current !== "listening") {
                            setStatus("idle");
                        }
                    }
                    break;

                case "audio":
                    if (message.audio) {
                        setStatus("speaking");
                        enqueueAudio(message.audio);
                    }
                    break;

                case "status":
                    if (message.status === "processing") {
                        setStatus("processing");
                    } else if (message.status === "done") {
                        // If mic is still on, go back to listening
                        setStatus("idle");
                    }
                    break;

                case "error":
                    setStatus("error");
                    break;
            }
        },
        [enqueueAudio]
    );

    const {
        isConnected,
        error: wsError,
        sendMessage,
    } = useWebSocket({
        url: WS_URL,
        onMessage: handleWsMessage,
        autoConnect: true,
    });

    // ── Voice (live streaming) ──
    const handleAudioChunk = useCallback(
        (base64: string) => {
            sendMessage({ type: "audio", audio: base64 });
        },
        [sendMessage]
    );

    const {
        isListening,
        error: micError,
        startListening,
        stopListening,
    } = useVoice({ onAudioChunk: handleAudioChunk });

    // ── Toggle live session ──
    const toggleSession = useCallback(async () => {
        if (isListening) {
            // End live session
            stopListening();
            stopPlayback();
            sendMessage({ type: "audio_end" });
            setStatus("idle");
        } else {
            // Start live session — mic stays on
            stopPlayback();
            await startListening();
            setStatus("listening");
            sendMessage({ type: "audio_start" });
        }
    }, [isListening, startListening, stopListening, stopPlayback, sendMessage]);

    // Derived: when AI finishes speaking, revert to listening if mic is on
    const effectiveStatus: BotStatus =
        status === "speaking" && !isPlaying
            ? isListening
                ? "listening"
                : "idle"
            : status;

    return (
        <div className="relative z-10 flex flex-col h-screen max-w-xl mx-auto">
            {/* ── Header ── */}
            <header className="flex items-center justify-between px-6 py-5">
                <h1 className="text-base font-semibold tracking-tight text-[var(--text-secondary)]">
                    voice
                </h1>

                {/* Glowing connection dot */}
                <div className="flex items-center gap-2">
                    <span
                        className={`
              w-2 h-2 rounded-full transition-colors duration-500
              ${isConnected
                                ? "bg-[var(--success)] text-[var(--success)] animate-glow-pulse"
                                : "bg-[var(--error)] text-[var(--error)] animate-glow-pulse"
                            }
            `}
                    />
                </div>
            </header>

            {/* ── Transcript ── */}
            <LiveTranscript entries={transcript} />

            {/* ── Controls ── */}
            <div className="flex flex-col items-center gap-6 px-6 pt-6 pb-10">
                <StatusIndicator
                    status={effectiveStatus}
                    errorMessage={wsError || micError}
                />

                <MicButton
                    isListening={isListening}
                    error={micError}
                    onClick={toggleSession}
                />

                <p className="text-xs text-[var(--text-tertiary)] tracking-wide font-medium">
                    {isListening ? "live · tap to end" : "tap to start"}
                </p>
            </div>
        </div>
    );
}
