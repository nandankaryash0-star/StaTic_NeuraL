"use client";

import { useState, useRef, useCallback } from "react";
import { base64ToArrayBuffer } from "@/lib/audioUtils";

export interface UseAudioPlaybackReturn {
    isPlaying: boolean;
    enqueueAudio: (base64Audio: string) => Promise<void>;
    stopPlayback: () => void;
}

/**
 * Hook that manages a gapless audio playback queue using the Web Audio API.
 * Incoming base64-encoded audio chunks are decoded and scheduled back-to-back.
 */
export function useAudioPlayback(): UseAudioPlaybackReturn {
    const [isPlaying, setIsPlaying] = useState(false);

    const audioContextRef = useRef<AudioContext | null>(null);
    const nextStartTimeRef = useRef(0);
    const activeSourcesRef = useRef<AudioBufferSourceNode[]>([]);

    /** Lazily create or resume the AudioContext. */
    const getContext = useCallback(() => {
        if (!audioContextRef.current || audioContextRef.current.state === "closed") {
            audioContextRef.current = new AudioContext({ sampleRate: 24000 });
        }
        if (audioContextRef.current.state === "suspended") {
            audioContextRef.current.resume();
        }
        return audioContextRef.current;
    }, []);

    const enqueueAudio = useCallback(
        async (base64Audio: string) => {
            const ctx = getContext();
            const arrayBuffer = base64ToArrayBuffer(base64Audio);

            try {
                const audioBuffer = await ctx.decodeAudioData(arrayBuffer);

                const source = ctx.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(ctx.destination);

                // Schedule gapless: play at nextStartTime or now, whichever is later
                const now = ctx.currentTime;
                const startAt = Math.max(nextStartTimeRef.current, now);
                source.start(startAt);

                nextStartTimeRef.current = startAt + audioBuffer.duration;
                activeSourcesRef.current.push(source);
                setIsPlaying(true);

                source.onended = () => {
                    activeSourcesRef.current = activeSourcesRef.current.filter(
                        (s) => s !== source
                    );
                    if (activeSourcesRef.current.length === 0) {
                        setIsPlaying(false);
                    }
                };
            } catch {
                // Non-decodable chunk — skip silently
                console.warn("Could not decode audio chunk, skipping.");
            }
        },
        [getContext]
    );

    const stopPlayback = useCallback(() => {
        activeSourcesRef.current.forEach((source) => {
            try {
                source.stop();
            } catch {
                /* already stopped */
            }
        });
        activeSourcesRef.current = [];
        nextStartTimeRef.current = 0;
        setIsPlaying(false);
    }, []);

    return { isPlaying, enqueueAudio, stopPlayback };
}
