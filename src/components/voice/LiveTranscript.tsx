"use client";

import { useEffect, useRef } from "react";

export interface TranscriptEntry {
    id: string;
    role: "user" | "ai";
    text: string;
    timestamp: Date;
}

interface LiveTranscriptProps {
    entries: TranscriptEntry[];
}

/**
 * Minimal scrolling transcript.
 * Auto-scrolls to bottom. User messages float right, AI float left.
 */
export default function LiveTranscript({ entries }: LiveTranscriptProps) {
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [entries]);

    if (entries.length === 0) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <div className="text-center space-y-3 select-none">
                    <p className="text-[var(--text-secondary)] text-base font-medium">
                        Tap the orb to begin a conversation
                    </p>
                    <p className="text-[var(--text-tertiary)] text-xs">
                        Your live transcript appears here
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto px-5 py-5 space-y-3 scroll-smooth"
        >
            {entries.map((entry) => (
                <div
                    key={entry.id}
                    className={`flex animate-fade-in-up ${entry.role === "user" ? "justify-end" : "justify-start"
                        }`}
                >
                    <div
                        className={`
              max-w-[75%] px-5 py-3.5 rounded-2xl text-[15px] leading-relaxed
              ${entry.role === "user"
                                ? "bg-[var(--user-bubble)] text-[var(--text-primary)] rounded-br-sm"
                                : "bg-[var(--ai-bubble)] text-[var(--text-secondary)] rounded-bl-sm border border-[var(--border-subtle)]"
                            }
            `}
                    >
                        <p>{entry.text}</p>
                        <span className="block mt-1.5 text-xs opacity-40 font-medium">
                            {entry.timestamp.toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                            })}
                        </span>
                    </div>
                </div>
            ))}
        </div>
    );
}
