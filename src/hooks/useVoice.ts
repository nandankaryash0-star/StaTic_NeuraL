"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { blobToBase64 } from "@/lib/audioUtils";

export interface UseVoiceOptions {
    /** Called each time a chunk of audio is captured (base64-encoded). */
    onAudioChunk?: (base64: string) => void;
    /** MediaRecorder timeslice in ms (default 100). */
    timeslice?: number;
}

export interface UseVoiceReturn {
    isListening: boolean;
    error: string | null;
    startListening: () => Promise<void>;
    stopListening: () => void;
}

/**
 * Hook for live, continuous microphone streaming.
 * Audio is captured via MediaRecorder at a low timeslice and
 * base64-encoded chunks are dispatched in real-time.
 *
 * Cleanup happens automatically on unmount.
 */
export function useVoice(options: UseVoiceOptions = {}): UseVoiceReturn {
    const { onAudioChunk, timeslice = 100 } = options;

    const [isListening, setIsListening] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const onAudioChunkRef = useRef(onAudioChunk);

    // Keep callback ref fresh
    useEffect(() => {
        onAudioChunkRef.current = onAudioChunk;
    }, [onAudioChunk]);

    const startListening = useCallback(async () => {
        setError(null);

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true,
                    sampleRate: 16000,
                },
            });

            streamRef.current = stream;

            const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
                ? "audio/webm;codecs=opus"
                : "audio/webm";

            const recorder = new MediaRecorder(stream, { mimeType });

            recorder.ondataavailable = async (event) => {
                if (event.data.size > 0 && onAudioChunkRef.current) {
                    const base64 = await blobToBase64(event.data);
                    onAudioChunkRef.current(base64);
                }
            };

            recorder.onerror = () => {
                setError("Recording error occurred.");
                setIsListening(false);
            };

            // Start with low timeslice for live streaming feel
            recorder.start(timeslice);
            mediaRecorderRef.current = recorder;
            setIsListening(true);
        } catch (err) {
            if (err instanceof DOMException && err.name === "NotAllowedError") {
                setError("Microphone access was denied");
            } else if (err instanceof DOMException && err.name === "NotFoundError") {
                setError("No microphone detected");
            } else {
                setError("Could not access microphone");
            }
            setIsListening(false);
        }
    }, [timeslice]);

    const stopListening = useCallback(() => {
        if (
            mediaRecorderRef.current &&
            mediaRecorderRef.current.state !== "inactive"
        ) {
            mediaRecorderRef.current.stop();
        }
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
        }
        mediaRecorderRef.current = null;
        setIsListening(false);
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (
                mediaRecorderRef.current &&
                mediaRecorderRef.current.state !== "inactive"
            ) {
                mediaRecorderRef.current.stop();
            }
            if (streamRef.current) {
                streamRef.current.getTracks().forEach((t) => t.stop());
            }
        };
    }, []);

    return { isListening, error, startListening, stopListening };
}
