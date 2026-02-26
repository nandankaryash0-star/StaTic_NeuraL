"use client";

import PulseAnimation from "./PulseAnimation";

interface MicButtonProps {
    isListening: boolean;
    disabled?: boolean;
    error?: string | null;
    onClick: () => void;
}

/**
 * Clean orb button — no icons, just a glowing circle.
 * Active state shows a breathing glow and pulse rings.
 */
export default function MicButton({ isListening, disabled, error, onClick }: MicButtonProps) {
    return (
        <div className="relative flex items-center justify-center">
            {/* Pulse rings behind the orb */}
            <div className="absolute w-44 h-44">
                <PulseAnimation isActive={isListening} />
            </div>

            {/* Orb */}
            <button
                id="mic-button"
                onClick={onClick}
                disabled={disabled}
                className={`
          relative z-10 w-20 h-20 rounded-full
          transition-all duration-500 ease-out
          cursor-pointer
          focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-primary)]
          ${isListening
                        ? "bg-gradient-to-br from-amber-700 to-orange-900 animate-breathe scale-110"
                        : "bg-[var(--bg-elevated)] hover:bg-[var(--bg-card)] hover:scale-105 border border-[var(--border-accent)]"
                    }
          ${disabled ? "opacity-30 cursor-not-allowed" : ""}
          ${error ? "ring-1 ring-red-500/40" : ""}
        `}
                aria-label={isListening ? "Stop" : "Start"}
            >
                {/* Inner dot — visual anchor instead of an icon */}
                <span
                    className={`block w-3 h-3 mx-auto rounded-full transition-all duration-500 ${isListening
                        ? "bg-white/90 scale-100"
                        : "bg-[var(--text-tertiary)] scale-75"
                        }`}
                />
            </button>

            {/* Error message */}
            {error && (
                <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 whitespace-nowrap animate-fade-in-up">
                    <p className="px-3 py-1 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 text-[11px] font-medium">
                        {error}
                    </p>
                </div>
            )}
        </div>
    );
}
