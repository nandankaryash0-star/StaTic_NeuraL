"use client";

export type BotStatus = "idle" | "listening" | "processing" | "speaking" | "error";

interface StatusIndicatorProps {
    status: BotStatus;
    errorMessage?: string | null;
}

const CONFIG: Record<BotStatus, { label: string; dotClass: string; textClass: string }> = {
    idle: {
        label: "Ready",
        dotClass: "bg-[var(--text-tertiary)]",
        textClass: "text-[var(--text-tertiary)]",
    },
    listening: {
        label: "Listening",
        dotClass: "bg-[var(--accent)]",
        textClass: "text-[var(--accent)]",
    },
    processing: {
        label: "Thinking",
        dotClass: "bg-orange-400",
        textClass: "text-orange-300",
    },
    speaking: {
        label: "Speaking",
        dotClass: "bg-yellow-200",
        textClass: "text-yellow-200",
    },
    error: {
        label: "Error",
        dotClass: "bg-red-400",
        textClass: "text-red-300",
    },
};

/**
 * Minimal status label — just text and a small dot,
 * with animated indicators for "thinking" and "speaking".
 */
export default function StatusIndicator({ status, errorMessage }: StatusIndicatorProps) {
    const cfg = CONFIG[status];

    return (
        <div className={`flex items-center gap-2 text-sm font-medium tracking-widest uppercase ${cfg.textClass} transition-colors duration-500`}>
            {/* Thinking: bouncing dots */}
            {status === "processing" && (
                <span className="flex gap-[3px]">
                    {[0, 1, 2].map((i) => (
                        <span key={i} className="w-1 h-1 rounded-full bg-orange-400 bounce-dot" />
                    ))}
                </span>
            )}

            {/* Speaking: wave bars */}
            {status === "speaking" && (
                <span className="flex items-center gap-[2px] h-4">
                    {[0, 1, 2, 3, 4].map((i) => (
                        <span key={i} className="w-[2px] rounded-full bg-yellow-200 wave-bar" style={{ height: 6 }} />
                    ))}
                </span>
            )}

            {/* Default: static dot */}
            {status !== "processing" && status !== "speaking" && (
                <span className={`w-1.5 h-1.5 rounded-full ${cfg.dotClass} ${status === "listening" ? "animate-pulse" : ""}`} />
            )}

            <span>{status === "error" && errorMessage ? errorMessage : cfg.label}</span>
        </div>
    );
}
