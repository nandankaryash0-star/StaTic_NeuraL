"use client";

interface PulseAnimationProps {
    isActive: boolean;
}

/**
 * Concentric rings that radiate outward from the center orb
 * during live listening.
 */
export default function PulseAnimation({ isActive }: PulseAnimationProps) {
    if (!isActive) return null;

    return (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="absolute w-full h-full rounded-full bg-[var(--accent)]/15 animate-pulse-ring" />
            <div className="absolute w-full h-full rounded-full bg-[var(--accent)]/10 animate-pulse-ring-2" />
            <div className="absolute w-full h-full rounded-full bg-[var(--accent)]/5 animate-pulse-ring-3" />
        </div>
    );
}
