"use client";

import { useState, useRef, useCallback, useEffect } from "react";

export type SpeechError =
    | "not-supported"
    | "not-allowed"
    | "no-speech"
    | "network"
    | "unknown"
    | null;

export interface UseSpeechToTextOptions {
    /** BCP-47 language tag, e.g., "en-US", "hi-IN". Defaults to browser locale. */
    lang?: string;
}

export interface UseSpeechToTextReturn {
    /** Whether the microphone is actively capturing speech. */
    isListening: boolean;
    /** Confirmed, final transcript text. */
    transcript: string;
    /** Real-time, unconfirmed text (still being processed). */
    interimTranscript: string;
    /** Structured error state. */
    error: SpeechError;
    /** Begin listening. Should be called from a direct user action. */
    startListening: () => void;
    /** Stop listening and freeze the current transcript. */
    stopListening: () => void;
    /** Clear all transcript text. */
    resetTranscript: () => void;
}

/**
 * useSpeechToText
 *
 * A robust Web Speech API hook for Next.js (Client Component only).
 *
 * Key behaviours:
 *  - Handles both `window.SpeechRecognition` and `window.webkitSpeechRecognition`
 *    (required for Safari + Chrome compatibility).
 *  - `continuous: true` + `interimResults: true` for a live typing effect.
 *  - Auto-restart on `onend` when `isListening` is still true, preventing
 *    the API from silently timing out during natural speech pauses.
 *  - Clean `abort()` on component unmount to release the microphone.
 */
export function useSpeechToText(
    options: UseSpeechToTextOptions = {}
): UseSpeechToTextReturn {
    const { lang = "en-US" } = options;

    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState("");
    const [interimTranscript, setInterimTranscript] = useState("");
    const [error, setError] = useState<SpeechError>(null);

    // Stable refs so callbacks never go stale in event handlers
    const recognitionRef = useRef<SpeechRecognition | null>(null);
    const isListeningRef = useRef(false);
    const transcriptRef = useRef("");

    // Keep refs in sync with state
    useEffect(() => {
        isListeningRef.current = isListening;
    }, [isListening]);

    /** Resolve the correct constructor — standard or webkit-prefixed. */
    const getRecognitionConstructor = useCallback(():
        | SpeechRecognitionStatic
        | undefined => {
        if (typeof window === "undefined") return undefined;
        return window.SpeechRecognition ?? window.webkitSpeechRecognition;
    }, []);

    /** Build a fresh SpeechRecognition instance with all handlers wired up. */
    const buildRecognition = useCallback((): SpeechRecognition | null => {
        const SpeechRecognitionImpl = getRecognitionConstructor();
        if (!SpeechRecognitionImpl) return null;

        const recognition = new SpeechRecognitionImpl();
        recognition.continuous = true;       // Don't stop after a single phrase
        recognition.interimResults = true;   // Surface partial results in real-time
        recognition.lang = lang;

        recognition.onstart = () => {
            setError(null);
        };

        recognition.onresult = (event: SpeechRecognitionEvent) => {
            let finalChunk = "";
            let interimChunk = "";

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const result = event.results[i];
                const text = result[0].transcript;

                if (result.isFinal) {
                    finalChunk += text;
                } else {
                    interimChunk += text;
                }
            }

            if (finalChunk) {
                // Append confirmed text to the accumulated transcript
                transcriptRef.current = (transcriptRef.current + " " + finalChunk).trim();
                setTranscript(transcriptRef.current);
                setInterimTranscript(""); // Clear interim once finalised
            } else {
                setInterimTranscript(interimChunk);
            }
        };

        recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
            switch (event.error) {
                case "not-allowed":
                case "service-not-allowed":
                    setError("not-allowed");
                    setIsListening(false);
                    isListeningRef.current = false;
                    break;
                case "no-speech":
                    // Non-fatal — auto-restart handles this silently
                    setError("no-speech");
                    break;
                case "network":
                    setError("network");
                    break;
                default:
                    setError("unknown");
            }
        };

        /**
         * Auto-restart on end:
         * The Web Speech API stops spontaneously after speech pauses or timeouts.
         * We re-call `start()` immediately if we still *want* to be listening,
         * creating a seamless, persistent "live" experience.
         */
        recognition.onend = () => {
            setInterimTranscript(""); // Clear any leftover interim on each restart
            if (isListeningRef.current) {
                try {
                    recognition.start();
                } catch {
                    // If the instance is already started (race condition), ignore.
                }
            }
        };

        return recognition;
    }, [getRecognitionConstructor, lang]);

    const startListening = useCallback(() => {
        const SpeechRecognitionImpl = getRecognitionConstructor();

        if (!SpeechRecognitionImpl) {
            setError("not-supported");
            return;
        }

        // Abort any previous instance cleanly
        if (recognitionRef.current) {
            recognitionRef.current.abort();
        }

        const recognition = buildRecognition();
        if (!recognition) {
            setError("not-supported");
            return;
        }

        recognitionRef.current = recognition;
        isListeningRef.current = true;
        setIsListening(true);
        setError(null);

        try {
            recognition.start();
        } catch {
            setError("unknown");
            setIsListening(false);
            isListeningRef.current = false;
        }
    }, [getRecognitionConstructor, buildRecognition]);

    const stopListening = useCallback(() => {
        isListeningRef.current = false;
        setIsListening(false);
        setInterimTranscript("");

        if (recognitionRef.current) {
            recognitionRef.current.stop(); // Graceful stop (flushes final result)
            recognitionRef.current = null;
        }
    }, []);

    const resetTranscript = useCallback(() => {
        transcriptRef.current = "";
        setTranscript("");
        setInterimTranscript("");
    }, []);

    // Cleanup on unmount — release the mic immediately
    useEffect(() => {
        return () => {
            if (recognitionRef.current) {
                isListeningRef.current = false;
                recognitionRef.current.abort();
                recognitionRef.current = null;
            }
        };
    }, []);

    return {
        isListening,
        transcript,
        interimTranscript,
        error,
        startListening,
        stopListening,
        resetTranscript,
    };
}
