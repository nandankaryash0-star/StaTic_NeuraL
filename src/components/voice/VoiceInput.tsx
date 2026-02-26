"use client";

import { useSpeechToText } from "@/hooks/useSpeechToText";

const ERROR_MESSAGES: Record<string, string> = {
    "not-supported": "Your browser doesn't support speech recognition. Try Chrome or Edge.",
    "not-allowed": "Microphone access was denied. Please allow it in your browser settings.",
    "no-speech": "No speech detected. Please try speaking again.",
    network: "Network error. Check your connection and try again.",
    unknown: "An unexpected error occurred. Please try again.",
};

/**
 * VoiceInput
 *
 * Standalone visual component built on useSpeechToText.
 * Shows a pulsing record button, live interim text, and confirmed transcript.
 * Designed to integrate cleanly with the existing Chocolate Truffle theme.
 */
export default function VoiceInput() {
    const {
        isListening,
        transcript,
        interimTranscript,
        error,
        startListening,
        stopListening,
        resetTranscript,
    } = useSpeechToText({ lang: "en-US" });

    const isEmpty = !transcript && !interimTranscript;

    return (
        <section className="relative z-10 w-full max-w-xl mx-auto px-6 pb-10">
            {/* ── Divider ── */}
            <div className="flex items-center gap-3 mb-8">
                <div className="flex-1 h-px bg-[var(--border-accent)]" />
                <span className="text-[11px] text-[var(--text-tertiary)] uppercase tracking-widest select-none">
                    speech capture
                </span>
                <div className="flex-1 h-px bg-[var(--border-accent)]" />
            </div>

            {/* ── Transcript Display ── */}
            <div
                className={`
          relative w-full min-h-[120px] rounded-2xl px-5 py-4 mb-6
          border transition-all duration-300
          ${isListening
                        ? "border-[var(--accent)]/40 bg-[var(--bg-elevated)]"
                        : "border-[var(--border-subtle)] bg-[var(--bg-card)]"
                    }
        `}
            >
                {/* Recording indicator halo */}
                {isListening && (
                    <span className="absolute top-3 right-3 flex h-2.5 w-2.5">
                        <span className="absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75 animate-ping" />
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
                    </span>
                )}

                {/* Placeholder when empty */}
                {isEmpty && !isListening && (
                    <p className="text-base text-[var(--text-tertiary)] font-light select-none">
                        Tap the button below and start speaking...
                    </p>
                )}

                {isEmpty && isListening && (
                    <p className="text-base text-[var(--text-tertiary)] italic animate-pulse select-none">
                        Listening...
                    </p>
                )}

                {/* Transcript content */}
                {!isEmpty && (
                    <p className="text-base leading-relaxed font-light">
                        {/* Final transcript — full opacity, confirmed */}
                        {transcript && (
                            <span className="text-[var(--text-primary)] font-normal">
                                {transcript}
                                {interimTranscript ? " " : ""}
                            </span>
                        )}
                        {/* Interim transcript — muted, still being processed */}
                        {interimTranscript && (
                            <span className="text-[var(--text-tertiary)] italic">
                                {interimTranscript}
                            </span>
                        )}
                    </p>
                )}
            </div>

            {/* ── Error Message ── */}
            {error && error !== "no-speech" && (
                <div className="mb-5 px-4 py-3 rounded-xl bg-[var(--error)]/10 border border-[var(--error)]/20 animate-fade-in-up">
                    <p className="text-sm text-[var(--error)]">
                        {ERROR_MESSAGES[error] ?? ERROR_MESSAGES.unknown}
                    </p>
                </div>
            )}

            {/* ── Controls ── */}
            <div className="flex items-center gap-4">
                {/* Record / Stop Button */}
                <button
                    id="voice-record-button"
                    onClick={isListening ? stopListening : startListening}
                    className={`
            relative flex items-center justify-center gap-2.5
            px-5 py-3 rounded-full text-sm font-medium
            transition-all duration-300 ease-out select-none
            focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]/40
            ${isListening
                            ? "bg-red-500/95 hover:bg-red-600 text-white"
                            : "bg-[var(--accent)] hover:opacity-90 text-white"
                        }
          `}
                    aria-label={isListening ? "Stop recording" : "Start recording"}
                >
                    {/* Pulsing outer ring when active */}
                    {isListening && (
                        <span className="absolute inset-0 rounded-full border-2 border-red-400 opacity-60 animate-pulse-ring pointer-events-none" />
                    )}

                    {/* Dot indicator */}
                    <span
                        className={`
              flex-shrink-0 w-2.5 h-2.5 rounded-full transition-all duration-300
              ${isListening ? "bg-white animate-pulse" : "bg-white/80"}
            `}
                    />
                    {isListening ? "Stop" : "Record"}
                </button>

                {/* Clear button — only shown when there's something to clear */}
                {(transcript || interimTranscript) && (
                    <button
                        id="voice-clear-button"
                        onClick={resetTranscript}
                        className="px-4 py-3 rounded-full text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-accent)] hover:border-[var(--border-subtle)] transition-all duration-200 select-none"
                        aria-label="Clear transcript"
                    >
                        Clear
                    </button>
                )}

                {/* Live word count */}
                {!isEmpty && (
                    <span className="ml-auto text-xs text-[var(--text-tertiary)] select-none">
                        {[transcript, interimTranscript]
                            .join(" ")
                            .trim()
                            .split(/\s+/)
                            .filter(Boolean).length}{" "}
                        words
                    </span>
                )}
            </div>
        </section>
    );
}
