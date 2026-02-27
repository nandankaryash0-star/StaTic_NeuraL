module.exports = [
"[project]/src/lib/audioUtils.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Audio utility helpers for encoding / decoding audio data
 * between the browser and WebSocket transport.
 */ /** Convert a Blob to a base64-encoded string. */ __turbopack_context__.s([
    "base64ToArrayBuffer",
    ()=>base64ToArrayBuffer,
    "blobToBase64",
    ()=>blobToBase64
]);
function blobToBase64(blob) {
    return new Promise((resolve, reject)=>{
        const reader = new FileReader();
        reader.onloadend = ()=>{
            const dataUrl = reader.result;
            // Strip the data URL prefix: "data:audio/webm;base64,..."
            const base64 = dataUrl.split(",")[1];
            resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}
function base64ToArrayBuffer(base64) {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for(let i = 0; i < len; i++){
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
}
}),
"[project]/src/hooks/useVoice.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useVoice",
    ()=>useVoice
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$audioUtils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/audioUtils.ts [app-ssr] (ecmascript)");
"use client";
;
;
function useVoice(options = {}) {
    const { onAudioChunk, timeslice = 100 } = options;
    const [isListening, setIsListening] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const mediaRecorderRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const streamRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const onAudioChunkRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(onAudioChunk);
    // Keep callback ref fresh
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        onAudioChunkRef.current = onAudioChunk;
    }, [
        onAudioChunk
    ]);
    const startListening = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(async ()=>{
        setError(null);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true,
                    sampleRate: 16000
                }
            });
            streamRef.current = stream;
            const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus") ? "audio/webm;codecs=opus" : "audio/webm";
            const recorder = new MediaRecorder(stream, {
                mimeType
            });
            recorder.ondataavailable = async (event)=>{
                if (event.data.size > 0 && onAudioChunkRef.current) {
                    const base64 = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$audioUtils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["blobToBase64"])(event.data);
                    onAudioChunkRef.current(base64);
                }
            };
            recorder.onerror = ()=>{
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
    }, [
        timeslice
    ]);
    const stopListening = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
            mediaRecorderRef.current.stop();
        }
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track)=>track.stop());
            streamRef.current = null;
        }
        mediaRecorderRef.current = null;
        setIsListening(false);
    }, []);
    // Cleanup on unmount
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        return ()=>{
            if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
                mediaRecorderRef.current.stop();
            }
            if (streamRef.current) {
                streamRef.current.getTracks().forEach((t)=>t.stop());
            }
        };
    }, []);
    return {
        isListening,
        error,
        startListening,
        stopListening
    };
}
}),
"[project]/src/hooks/useWebSocket.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useWebSocket",
    ()=>useWebSocket
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
"use client";
;
function useWebSocket(options) {
    const { url, onMessage, maxRetries = 5, autoConnect = true } = options;
    const [isConnected, setIsConnected] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const wsRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const retriesRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(0);
    const reconnectTimerRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const intentionalCloseRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(false);
    const onMessageRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(onMessage);
    // Keep callback ref fresh without triggering reconnect
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        onMessageRef.current = onMessage;
    }, [
        onMessage
    ]);
    const connect = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        // Cleanup previous connection
        if (wsRef.current) {
            intentionalCloseRef.current = true;
            wsRef.current.close();
        }
        intentionalCloseRef.current = false;
        setError(null);
        try {
            const ws = new WebSocket(url);
            ws.onopen = ()=>{
                setIsConnected(true);
                setError(null);
                retriesRef.current = 0;
            };
            ws.onmessage = (event)=>{
                try {
                    const data = typeof event.data === "string" ? JSON.parse(event.data) : event.data;
                    onMessageRef.current?.(data);
                } catch  {
                    // If not JSON, treat as plain text transcript
                    onMessageRef.current?.({
                        type: "transcript",
                        content: event.data,
                        role: "ai"
                    });
                }
            };
            ws.onerror = ()=>{
                setError("WebSocket connection error.");
            };
            ws.onclose = ()=>{
                setIsConnected(false);
                wsRef.current = null;
                // Auto-reconnect unless intentionally closed
                if (!intentionalCloseRef.current && retriesRef.current < maxRetries) {
                    const delay = Math.min(1000 * 2 ** retriesRef.current, 30000);
                    retriesRef.current += 1;
                    setError(`Disconnected. Reconnecting in ${Math.round(delay / 1000)}s…`);
                    reconnectTimerRef.current = setTimeout(()=>{
                        connect();
                    }, delay);
                } else if (retriesRef.current >= maxRetries) {
                    setError("Connection lost. Please refresh the page.");
                }
            };
            wsRef.current = ws;
        } catch  {
            setError("Failed to create WebSocket connection.");
        }
    }, [
        url,
        maxRetries
    ]);
    const disconnect = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        intentionalCloseRef.current = true;
        if (reconnectTimerRef.current) {
            clearTimeout(reconnectTimerRef.current);
        }
        if (wsRef.current) {
            wsRef.current.close();
        }
        setIsConnected(false);
    }, []);
    const sendMessage = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((data)=>{
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            const payload = typeof data === "object" && !(data instanceof ArrayBuffer) ? JSON.stringify(data) : data;
            wsRef.current.send(payload);
        }
    }, []);
    // Auto-connect on mount
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (autoConnect) {
            connect();
        }
        return ()=>{
            disconnect();
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    return {
        isConnected,
        error,
        sendMessage,
        connect,
        disconnect
    };
}
}),
"[project]/src/hooks/useAudioPlayback.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useAudioPlayback",
    ()=>useAudioPlayback
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$audioUtils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/audioUtils.ts [app-ssr] (ecmascript)");
"use client";
;
;
function useAudioPlayback() {
    const [isPlaying, setIsPlaying] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const audioContextRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const nextStartTimeRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(0);
    const activeSourcesRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])([]);
    /** Lazily create or resume the AudioContext. */ const getContext = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        if (!audioContextRef.current || audioContextRef.current.state === "closed") {
            audioContextRef.current = new AudioContext({
                sampleRate: 24000
            });
        }
        if (audioContextRef.current.state === "suspended") {
            audioContextRef.current.resume();
        }
        return audioContextRef.current;
    }, []);
    const enqueueAudio = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(async (base64Audio)=>{
        const ctx = getContext();
        const arrayBuffer = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$audioUtils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["base64ToArrayBuffer"])(base64Audio);
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
            source.onended = ()=>{
                activeSourcesRef.current = activeSourcesRef.current.filter((s)=>s !== source);
                if (activeSourcesRef.current.length === 0) {
                    setIsPlaying(false);
                }
            };
        } catch  {
            // Non-decodable chunk — skip silently
            console.warn("Could not decode audio chunk, skipping.");
        }
    }, [
        getContext
    ]);
    const stopPlayback = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        activeSourcesRef.current.forEach((source)=>{
            try {
                source.stop();
            } catch  {
            /* already stopped */ }
        });
        activeSourcesRef.current = [];
        nextStartTimeRef.current = 0;
        setIsPlaying(false);
    }, []);
    return {
        isPlaying,
        enqueueAudio,
        stopPlayback
    };
}
}),
"[project]/src/components/voice/PulseAnimation.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>PulseAnimation
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
"use client";
;
function PulseAnimation({ isActive }) {
    if (!isActive) return null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "absolute inset-0 flex items-center justify-center pointer-events-none",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute w-full h-full rounded-full bg-[var(--accent)]/15 animate-pulse-ring"
            }, void 0, false, {
                fileName: "[project]/src/components/voice/PulseAnimation.tsx",
                lineNumber: 16,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute w-full h-full rounded-full bg-[var(--accent)]/10 animate-pulse-ring-2"
            }, void 0, false, {
                fileName: "[project]/src/components/voice/PulseAnimation.tsx",
                lineNumber: 17,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute w-full h-full rounded-full bg-[var(--accent)]/5 animate-pulse-ring-3"
            }, void 0, false, {
                fileName: "[project]/src/components/voice/PulseAnimation.tsx",
                lineNumber: 18,
                columnNumber: 13
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/voice/PulseAnimation.tsx",
        lineNumber: 15,
        columnNumber: 9
    }, this);
}
}),
"[project]/src/components/voice/MicButton.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>MicButton
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$voice$2f$PulseAnimation$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/voice/PulseAnimation.tsx [app-ssr] (ecmascript)");
"use client";
;
;
function MicButton({ isListening, disabled, error, onClick }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "relative flex items-center justify-center",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute w-44 h-44",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$voice$2f$PulseAnimation$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                    isActive: isListening
                }, void 0, false, {
                    fileName: "[project]/src/components/voice/MicButton.tsx",
                    lineNumber: 21,
                    columnNumber: 17
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/voice/MicButton.tsx",
                lineNumber: 20,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                id: "mic-button",
                onClick: onClick,
                disabled: disabled,
                className: `
          relative z-10 w-20 h-20 rounded-full
          transition-all duration-500 ease-out
          cursor-pointer
          focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-primary)]
          ${isListening ? "bg-gradient-to-br from-amber-700 to-orange-900 animate-breathe scale-110" : "bg-[var(--bg-elevated)] hover:bg-[var(--bg-card)] hover:scale-105 border border-[var(--border-accent)]"}
          ${disabled ? "opacity-30 cursor-not-allowed" : ""}
          ${error ? "ring-1 ring-red-500/40" : ""}
        `,
                "aria-label": isListening ? "Stop" : "Start",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: `block w-3 h-3 mx-auto rounded-full transition-all duration-500 ${isListening ? "bg-white/90 scale-100" : "bg-[var(--text-tertiary)] scale-75"}`
                }, void 0, false, {
                    fileName: "[project]/src/components/voice/MicButton.tsx",
                    lineNumber: 44,
                    columnNumber: 17
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/voice/MicButton.tsx",
                lineNumber: 25,
                columnNumber: 13
            }, this),
            error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute -bottom-12 left-1/2 -translate-x-1/2 whitespace-nowrap animate-fade-in-up",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "px-3 py-1 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 text-[11px] font-medium",
                    children: error
                }, void 0, false, {
                    fileName: "[project]/src/components/voice/MicButton.tsx",
                    lineNumber: 55,
                    columnNumber: 21
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/voice/MicButton.tsx",
                lineNumber: 54,
                columnNumber: 17
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/voice/MicButton.tsx",
        lineNumber: 18,
        columnNumber: 9
    }, this);
}
}),
"[project]/src/components/voice/StatusIndicator.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>StatusIndicator
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
"use client";
;
const CONFIG = {
    idle: {
        label: "Ready",
        dotClass: "bg-[var(--text-tertiary)]",
        textClass: "text-[var(--text-tertiary)]"
    },
    listening: {
        label: "Listening",
        dotClass: "bg-[var(--accent)]",
        textClass: "text-[var(--accent)]"
    },
    processing: {
        label: "Thinking",
        dotClass: "bg-orange-400",
        textClass: "text-orange-300"
    },
    speaking: {
        label: "Speaking",
        dotClass: "bg-yellow-200",
        textClass: "text-yellow-200"
    },
    error: {
        label: "Error",
        dotClass: "bg-red-400",
        textClass: "text-red-300"
    }
};
function StatusIndicator({ status, errorMessage }) {
    const cfg = CONFIG[status];
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: `flex items-center gap-2 text-sm font-medium tracking-widest uppercase ${cfg.textClass} transition-colors duration-500`,
        children: [
            status === "processing" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "flex gap-[3px]",
                children: [
                    0,
                    1,
                    2
                ].map((i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "w-1 h-1 rounded-full bg-orange-400 bounce-dot"
                    }, i, false, {
                        fileName: "[project]/src/components/voice/StatusIndicator.tsx",
                        lineNumber: 51,
                        columnNumber: 25
                    }, this))
            }, void 0, false, {
                fileName: "[project]/src/components/voice/StatusIndicator.tsx",
                lineNumber: 49,
                columnNumber: 17
            }, this),
            status === "speaking" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "flex items-center gap-[2px] h-4",
                children: [
                    0,
                    1,
                    2,
                    3,
                    4
                ].map((i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "w-[2px] rounded-full bg-yellow-200 wave-bar",
                        style: {
                            height: 6
                        }
                    }, i, false, {
                        fileName: "[project]/src/components/voice/StatusIndicator.tsx",
                        lineNumber: 60,
                        columnNumber: 25
                    }, this))
            }, void 0, false, {
                fileName: "[project]/src/components/voice/StatusIndicator.tsx",
                lineNumber: 58,
                columnNumber: 17
            }, this),
            status !== "processing" && status !== "speaking" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: `w-1.5 h-1.5 rounded-full ${cfg.dotClass} ${status === "listening" ? "animate-pulse" : ""}`
            }, void 0, false, {
                fileName: "[project]/src/components/voice/StatusIndicator.tsx",
                lineNumber: 67,
                columnNumber: 17
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                children: status === "error" && errorMessage ? errorMessage : cfg.label
            }, void 0, false, {
                fileName: "[project]/src/components/voice/StatusIndicator.tsx",
                lineNumber: 70,
                columnNumber: 13
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/voice/StatusIndicator.tsx",
        lineNumber: 46,
        columnNumber: 9
    }, this);
}
}),
"[project]/src/components/voice/LiveTranscript.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>LiveTranscript
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
"use client";
;
;
function LiveTranscript({ entries }) {
    const scrollRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [
        entries
    ]);
    if (entries.length === 0) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex-1 flex items-center justify-center",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "text-center space-y-3 select-none",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-[var(--text-secondary)] text-base font-medium",
                        children: "Tap the orb to begin a conversation"
                    }, void 0, false, {
                        fileName: "[project]/src/components/voice/LiveTranscript.tsx",
                        lineNumber: 33,
                        columnNumber: 21
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-[var(--text-tertiary)] text-xs",
                        children: "Your live transcript appears here"
                    }, void 0, false, {
                        fileName: "[project]/src/components/voice/LiveTranscript.tsx",
                        lineNumber: 36,
                        columnNumber: 21
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/voice/LiveTranscript.tsx",
                lineNumber: 32,
                columnNumber: 17
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/components/voice/LiveTranscript.tsx",
            lineNumber: 31,
            columnNumber: 13
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        ref: scrollRef,
        className: "flex-1 overflow-y-auto px-5 py-5 space-y-3 scroll-smooth",
        children: entries.map((entry)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: `flex animate-fade-in-up ${entry.role === "user" ? "justify-end" : "justify-start"}`,
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: `
              max-w-[75%] px-5 py-3.5 rounded-2xl text-[15px] leading-relaxed
              ${entry.role === "user" ? "bg-[var(--user-bubble)] text-[var(--text-primary)] rounded-br-sm" : "bg-[var(--ai-bubble)] text-[var(--text-secondary)] rounded-bl-sm border border-[var(--border-subtle)]"}
            `,
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            children: entry.text
                        }, void 0, false, {
                            fileName: "[project]/src/components/voice/LiveTranscript.tsx",
                            lineNumber: 64,
                            columnNumber: 25
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "block mt-1.5 text-xs opacity-40 font-medium",
                            children: entry.timestamp.toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit"
                            })
                        }, void 0, false, {
                            fileName: "[project]/src/components/voice/LiveTranscript.tsx",
                            lineNumber: 65,
                            columnNumber: 25
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/voice/LiveTranscript.tsx",
                    lineNumber: 55,
                    columnNumber: 21
                }, this)
            }, entry.id, false, {
                fileName: "[project]/src/components/voice/LiveTranscript.tsx",
                lineNumber: 50,
                columnNumber: 17
            }, this))
    }, void 0, false, {
        fileName: "[project]/src/components/voice/LiveTranscript.tsx",
        lineNumber: 45,
        columnNumber: 9
    }, this);
}
}),
"[project]/src/components/voice/VoiceInterface.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>VoiceInterface
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useVoice$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/hooks/useVoice.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useWebSocket$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/hooks/useWebSocket.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useAudioPlayback$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/hooks/useAudioPlayback.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$voice$2f$MicButton$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/voice/MicButton.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$voice$2f$StatusIndicator$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/voice/StatusIndicator.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$voice$2f$LiveTranscript$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/voice/LiveTranscript.tsx [app-ssr] (ecmascript)");
"use client";
;
;
;
;
;
;
;
;
const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8080/ws";
function VoiceInterface() {
    const [status, setStatus] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("idle");
    const [transcript, setTranscript] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const statusRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(status);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        statusRef.current = status;
    }, [
        status
    ]);
    // ── Audio Playback ──
    const { isPlaying, enqueueAudio, stopPlayback } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useAudioPlayback$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useAudioPlayback"])();
    // ── WebSocket ──
    const handleWsMessage = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((message)=>{
        switch(message.type){
            case "transcript":
                if (message.content) {
                    setTranscript((prev)=>[
                            ...prev,
                            {
                                id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
                                role: message.role || "ai",
                                text: message.content,
                                timestamp: new Date()
                            }
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
    }, [
        enqueueAudio
    ]);
    const { isConnected, error: wsError, sendMessage } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useWebSocket$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useWebSocket"])({
        url: WS_URL,
        onMessage: handleWsMessage,
        autoConnect: true
    });
    // ── Voice (live streaming) ──
    const handleAudioChunk = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((base64)=>{
        sendMessage({
            type: "audio",
            audio: base64
        });
    }, [
        sendMessage
    ]);
    const { isListening, error: micError, startListening, stopListening } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useVoice$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useVoice"])({
        onAudioChunk: handleAudioChunk
    });
    // ── Toggle live session ──
    const toggleSession = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(async ()=>{
        if (isListening) {
            // End live session
            stopListening();
            stopPlayback();
            sendMessage({
                type: "audio_end"
            });
            setStatus("idle");
        } else {
            // Start live session — mic stays on
            stopPlayback();
            await startListening();
            setStatus("listening");
            sendMessage({
                type: "audio_start"
            });
        }
    }, [
        isListening,
        startListening,
        stopListening,
        stopPlayback,
        sendMessage
    ]);
    // Derived: when AI finishes speaking, revert to listening if mic is on
    const effectiveStatus = status === "speaking" && !isPlaying ? isListening ? "listening" : "idle" : status;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "relative z-10 flex flex-col h-screen max-w-xl mx-auto",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
                className: "flex items-center justify-between px-6 py-5",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                        className: "text-base font-semibold tracking-tight text-[var(--text-secondary)]",
                        children: "voice"
                    }, void 0, false, {
                        fileName: "[project]/src/components/voice/VoiceInterface.tsx",
                        lineNumber: 133,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-2",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: `
              w-2 h-2 rounded-full transition-colors duration-500
              ${isConnected ? "bg-[var(--success)] text-[var(--success)] animate-glow-pulse" : "bg-[var(--error)] text-[var(--error)] animate-glow-pulse"}
            `
                        }, void 0, false, {
                            fileName: "[project]/src/components/voice/VoiceInterface.tsx",
                            lineNumber: 139,
                            columnNumber: 21
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/voice/VoiceInterface.tsx",
                        lineNumber: 138,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/voice/VoiceInterface.tsx",
                lineNumber: 132,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$voice$2f$LiveTranscript$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                entries: transcript
            }, void 0, false, {
                fileName: "[project]/src/components/voice/VoiceInterface.tsx",
                lineNumber: 152,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex flex-col items-center gap-6 px-6 pt-6 pb-10",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$voice$2f$StatusIndicator$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                        status: effectiveStatus,
                        errorMessage: wsError || micError
                    }, void 0, false, {
                        fileName: "[project]/src/components/voice/VoiceInterface.tsx",
                        lineNumber: 156,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$voice$2f$MicButton$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                        isListening: isListening,
                        error: micError,
                        onClick: toggleSession
                    }, void 0, false, {
                        fileName: "[project]/src/components/voice/VoiceInterface.tsx",
                        lineNumber: 161,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-xs text-[var(--text-tertiary)] tracking-wide font-medium",
                        children: isListening ? "live · tap to end" : "tap to start"
                    }, void 0, false, {
                        fileName: "[project]/src/components/voice/VoiceInterface.tsx",
                        lineNumber: 167,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/voice/VoiceInterface.tsx",
                lineNumber: 155,
                columnNumber: 13
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/voice/VoiceInterface.tsx",
        lineNumber: 130,
        columnNumber: 9
    }, this);
}
}),
"[project]/src/hooks/useSpeechToText.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useSpeechToText",
    ()=>useSpeechToText
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
"use client";
;
function useSpeechToText(options = {}) {
    const { lang = "en-US" } = options;
    const [isListening, setIsListening] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [transcript, setTranscript] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [interimTranscript, setInterimTranscript] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    // Stable refs so callbacks never go stale in event handlers
    const recognitionRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const isListeningRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(false);
    const transcriptRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])("");
    // Keep refs in sync with state
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        isListeningRef.current = isListening;
    }, [
        isListening
    ]);
    /** Resolve the correct constructor — standard or webkit-prefixed. */ const getRecognitionConstructor = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        if ("TURBOPACK compile-time truthy", 1) return undefined;
        //TURBOPACK unreachable
        ;
    }, []);
    /** Build a fresh SpeechRecognition instance with all handlers wired up. */ const buildRecognition = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        const SpeechRecognitionImpl = getRecognitionConstructor();
        if (!SpeechRecognitionImpl) return null;
        const recognition = new SpeechRecognitionImpl();
        recognition.continuous = true; // Don't stop after a single phrase
        recognition.interimResults = true; // Surface partial results in real-time
        recognition.lang = lang;
        recognition.onstart = ()=>{
            setError(null);
        };
        recognition.onresult = (event)=>{
            let finalChunk = "";
            let interimChunk = "";
            for(let i = event.resultIndex; i < event.results.length; i++){
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
        recognition.onerror = (event)=>{
            switch(event.error){
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
         */ recognition.onend = ()=>{
            setInterimTranscript(""); // Clear any leftover interim on each restart
            if (isListeningRef.current) {
                try {
                    recognition.start();
                } catch  {
                // If the instance is already started (race condition), ignore.
                }
            }
        };
        return recognition;
    }, [
        getRecognitionConstructor,
        lang
    ]);
    const startListening = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
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
        } catch  {
            setError("unknown");
            setIsListening(false);
            isListeningRef.current = false;
        }
    }, [
        getRecognitionConstructor,
        buildRecognition
    ]);
    const stopListening = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        isListeningRef.current = false;
        setIsListening(false);
        setInterimTranscript("");
        if (recognitionRef.current) {
            recognitionRef.current.stop(); // Graceful stop (flushes final result)
            recognitionRef.current = null;
        }
    }, []);
    const resetTranscript = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        transcriptRef.current = "";
        setTranscript("");
        setInterimTranscript("");
    }, []);
    // Cleanup on unmount — release the mic immediately
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        return ()=>{
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
        resetTranscript
    };
}
}),
"[project]/src/components/voice/VoiceInput.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>VoiceInput
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useSpeechToText$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/hooks/useSpeechToText.ts [app-ssr] (ecmascript)");
"use client";
;
;
const ERROR_MESSAGES = {
    "not-supported": "Your browser doesn't support speech recognition. Try Chrome or Edge.",
    "not-allowed": "Microphone access was denied. Please allow it in your browser settings.",
    "no-speech": "No speech detected. Please try speaking again.",
    network: "Network error. Check your connection and try again.",
    unknown: "An unexpected error occurred. Please try again."
};
function VoiceInput() {
    const { isListening, transcript, interimTranscript, error, startListening, stopListening, resetTranscript } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useSpeechToText$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useSpeechToText"])({
        lang: "en-US"
    });
    const isEmpty = !transcript && !interimTranscript;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
        className: "relative z-10 w-full max-w-xl mx-auto px-6 pb-10",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center gap-3 mb-8",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex-1 h-px bg-[var(--border-accent)]"
                    }, void 0, false, {
                        fileName: "[project]/src/components/voice/VoiceInput.tsx",
                        lineNumber: 37,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-[11px] text-[var(--text-tertiary)] uppercase tracking-widest select-none",
                        children: "speech capture"
                    }, void 0, false, {
                        fileName: "[project]/src/components/voice/VoiceInput.tsx",
                        lineNumber: 38,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex-1 h-px bg-[var(--border-accent)]"
                    }, void 0, false, {
                        fileName: "[project]/src/components/voice/VoiceInput.tsx",
                        lineNumber: 41,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/voice/VoiceInput.tsx",
                lineNumber: 36,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: `
          relative w-full min-h-[120px] rounded-2xl px-5 py-4 mb-6
          border transition-all duration-300
          ${isListening ? "border-[var(--accent)]/40 bg-[var(--bg-elevated)]" : "border-[var(--border-subtle)] bg-[var(--bg-card)]"}
        `,
                children: [
                    isListening && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "absolute top-3 right-3 flex h-2.5 w-2.5",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75 animate-ping"
                            }, void 0, false, {
                                fileName: "[project]/src/components/voice/VoiceInput.tsx",
                                lineNumber: 58,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"
                            }, void 0, false, {
                                fileName: "[project]/src/components/voice/VoiceInput.tsx",
                                lineNumber: 59,
                                columnNumber: 25
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/voice/VoiceInput.tsx",
                        lineNumber: 57,
                        columnNumber: 21
                    }, this),
                    isEmpty && !isListening && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-base text-[var(--text-tertiary)] font-light select-none",
                        children: "Tap the button below and start speaking..."
                    }, void 0, false, {
                        fileName: "[project]/src/components/voice/VoiceInput.tsx",
                        lineNumber: 65,
                        columnNumber: 21
                    }, this),
                    isEmpty && isListening && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-base text-[var(--text-tertiary)] italic animate-pulse select-none",
                        children: "Listening..."
                    }, void 0, false, {
                        fileName: "[project]/src/components/voice/VoiceInput.tsx",
                        lineNumber: 71,
                        columnNumber: 21
                    }, this),
                    !isEmpty && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-base leading-relaxed font-light",
                        children: [
                            transcript && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-[var(--text-primary)] font-normal",
                                children: [
                                    transcript,
                                    interimTranscript ? " " : ""
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/voice/VoiceInput.tsx",
                                lineNumber: 81,
                                columnNumber: 29
                            }, this),
                            interimTranscript && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-[var(--text-tertiary)] italic",
                                children: interimTranscript
                            }, void 0, false, {
                                fileName: "[project]/src/components/voice/VoiceInput.tsx",
                                lineNumber: 88,
                                columnNumber: 29
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/voice/VoiceInput.tsx",
                        lineNumber: 78,
                        columnNumber: 21
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/voice/VoiceInput.tsx",
                lineNumber: 45,
                columnNumber: 13
            }, this),
            error && error !== "no-speech" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mb-5 px-4 py-3 rounded-xl bg-[var(--error)]/10 border border-[var(--error)]/20 animate-fade-in-up",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "text-sm text-[var(--error)]",
                    children: ERROR_MESSAGES[error] ?? ERROR_MESSAGES.unknown
                }, void 0, false, {
                    fileName: "[project]/src/components/voice/VoiceInput.tsx",
                    lineNumber: 99,
                    columnNumber: 21
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/voice/VoiceInput.tsx",
                lineNumber: 98,
                columnNumber: 17
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center gap-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        id: "voice-record-button",
                        onClick: isListening ? stopListening : startListening,
                        className: `
            relative flex items-center justify-center gap-2.5
            px-5 py-3 rounded-full text-sm font-medium
            transition-all duration-300 ease-out select-none
            focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]/40
            ${isListening ? "bg-red-500/95 hover:bg-red-600 text-white" : "bg-[var(--accent)] hover:opacity-90 text-white"}
          `,
                        "aria-label": isListening ? "Stop recording" : "Start recording",
                        children: [
                            isListening && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "absolute inset-0 rounded-full border-2 border-red-400 opacity-60 animate-pulse-ring pointer-events-none"
                            }, void 0, false, {
                                fileName: "[project]/src/components/voice/VoiceInput.tsx",
                                lineNumber: 125,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: `
              flex-shrink-0 w-2.5 h-2.5 rounded-full transition-all duration-300
              ${isListening ? "bg-white animate-pulse" : "bg-white/80"}
            `
                            }, void 0, false, {
                                fileName: "[project]/src/components/voice/VoiceInput.tsx",
                                lineNumber: 129,
                                columnNumber: 21
                            }, this),
                            isListening ? "Stop" : "Record"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/voice/VoiceInput.tsx",
                        lineNumber: 108,
                        columnNumber: 17
                    }, this),
                    (transcript || interimTranscript) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        id: "voice-clear-button",
                        onClick: resetTranscript,
                        className: "px-4 py-3 rounded-full text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-accent)] hover:border-[var(--border-subtle)] transition-all duration-200 select-none",
                        "aria-label": "Clear transcript",
                        children: "Clear"
                    }, void 0, false, {
                        fileName: "[project]/src/components/voice/VoiceInput.tsx",
                        lineNumber: 140,
                        columnNumber: 21
                    }, this),
                    !isEmpty && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "ml-auto text-xs text-[var(--text-tertiary)] select-none",
                        children: [
                            [
                                transcript,
                                interimTranscript
                            ].join(" ").trim().split(/\s+/).filter(Boolean).length,
                            " ",
                            "words"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/voice/VoiceInput.tsx",
                        lineNumber: 152,
                        columnNumber: 21
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/voice/VoiceInput.tsx",
                lineNumber: 106,
                columnNumber: 13
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/voice/VoiceInput.tsx",
        lineNumber: 34,
        columnNumber: 9
    }, this);
}
}),
"[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

module.exports = __turbopack_context__.r("[project]/node_modules/next/dist/server/route-modules/app-page/module.compiled.js [app-ssr] (ecmascript)").vendored['react-ssr'].ReactJsxDevRuntime; //# sourceMappingURL=react-jsx-dev-runtime.js.map
}),
];

//# sourceMappingURL=_96c2bcea._.js.map