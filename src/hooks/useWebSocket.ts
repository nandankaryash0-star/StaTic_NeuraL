"use client";

import { useState, useRef, useCallback, useEffect } from "react";

export interface WebSocketMessage {
    type: "transcript" | "audio" | "status" | "error";
    content?: string;
    audio?: string; // base64-encoded audio
    role?: "user" | "ai";
    status?: string;
}

export interface UseWebSocketOptions {
    url: string;
    onMessage?: (message: WebSocketMessage) => void;
    /** Max reconnection attempts (default 5). */
    maxRetries?: number;
    /** Whether to auto-connect on mount (default true). */
    autoConnect?: boolean;
}

export interface UseWebSocketReturn {
    isConnected: boolean;
    error: string | null;
    sendMessage: (data: string | ArrayBuffer | Record<string, unknown>) => void;
    connect: () => void;
    disconnect: () => void;
}

/**
 * Persistent WebSocket hook with exponential-backoff reconnection.
 */
export function useWebSocket(options: UseWebSocketOptions): UseWebSocketReturn {
    const { url, onMessage, maxRetries = 5, autoConnect = true } = options;

    const [isConnected, setIsConnected] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const wsRef = useRef<WebSocket | null>(null);
    const retriesRef = useRef(0);
    const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const intentionalCloseRef = useRef(false);
    const onMessageRef = useRef(onMessage);

    // Keep callback ref fresh without triggering reconnect
    useEffect(() => {
        onMessageRef.current = onMessage;
    }, [onMessage]);

    const connect = useCallback(() => {
        // Cleanup previous connection
        if (wsRef.current) {
            intentionalCloseRef.current = true;
            wsRef.current.close();
        }

        intentionalCloseRef.current = false;
        setError(null);

        try {
            const ws = new WebSocket(url);

            ws.onopen = () => {
                setIsConnected(true);
                setError(null);
                retriesRef.current = 0;
            };

            ws.onmessage = (event) => {
                try {
                    const data: WebSocketMessage =
                        typeof event.data === "string"
                            ? JSON.parse(event.data)
                            : event.data;
                    onMessageRef.current?.(data);
                } catch {
                    // If not JSON, treat as plain text transcript
                    onMessageRef.current?.({ type: "transcript", content: event.data, role: "ai" });
                }
            };

            ws.onerror = () => {
                setError("WebSocket connection error.");
            };

            ws.onclose = () => {
                setIsConnected(false);
                wsRef.current = null;

                // Auto-reconnect unless intentionally closed
                if (!intentionalCloseRef.current && retriesRef.current < maxRetries) {
                    const delay = Math.min(1000 * 2 ** retriesRef.current, 30000);
                    retriesRef.current += 1;
                    setError(`Disconnected. Reconnecting in ${Math.round(delay / 1000)}s…`);
                    reconnectTimerRef.current = setTimeout(() => {
                        connect();
                    }, delay);
                } else if (retriesRef.current >= maxRetries) {
                    setError("Connection lost. Please refresh the page.");
                }
            };

            wsRef.current = ws;
        } catch {
            setError("Failed to create WebSocket connection.");
        }
    }, [url, maxRetries]);

    const disconnect = useCallback(() => {
        intentionalCloseRef.current = true;
        if (reconnectTimerRef.current) {
            clearTimeout(reconnectTimerRef.current);
        }
        if (wsRef.current) {
            wsRef.current.close();
        }
        setIsConnected(false);
    }, []);

    const sendMessage = useCallback(
        (data: string | ArrayBuffer | Record<string, unknown>) => {
            if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
                const payload = typeof data === "object" && !(data instanceof ArrayBuffer)
                    ? JSON.stringify(data)
                    : data;
                wsRef.current.send(payload as string | ArrayBuffer);
            }
        },
        []
    );

    // Auto-connect on mount
    useEffect(() => {
        if (autoConnect) {
            connect();
        }
        return () => {
            disconnect();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return { isConnected, error, sendMessage, connect, disconnect };
}
