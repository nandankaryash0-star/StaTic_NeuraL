(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/lib/audioUtils.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
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
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/hooks/useVoice.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useVoice",
    ()=>useVoice
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$audioUtils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/audioUtils.ts [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature();
"use client";
;
;
function useVoice() {
    let options = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    _s();
    const { onAudioChunk, timeslice = 100 } = options;
    const [isListening, setIsListening] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const mediaRecorderRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const streamRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const onAudioChunkRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(onAudioChunk);
    // Keep callback ref fresh
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "useVoice.useEffect": ()=>{
            onAudioChunkRef.current = onAudioChunk;
        }
    }["useVoice.useEffect"], [
        onAudioChunk
    ]);
    const startListening = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useVoice.useCallback[startListening]": async ()=>{
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
                recorder.ondataavailable = ({
                    "useVoice.useCallback[startListening]": async (event)=>{
                        if (event.data.size > 0 && onAudioChunkRef.current) {
                            const base64 = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$audioUtils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["blobToBase64"])(event.data);
                            onAudioChunkRef.current(base64);
                        }
                    }
                })["useVoice.useCallback[startListening]"];
                recorder.onerror = ({
                    "useVoice.useCallback[startListening]": ()=>{
                        setError("Recording error occurred.");
                        setIsListening(false);
                    }
                })["useVoice.useCallback[startListening]"];
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
        }
    }["useVoice.useCallback[startListening]"], [
        timeslice
    ]);
    const stopListening = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useVoice.useCallback[stopListening]": ()=>{
            if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
                mediaRecorderRef.current.stop();
            }
            if (streamRef.current) {
                streamRef.current.getTracks().forEach({
                    "useVoice.useCallback[stopListening]": (track)=>track.stop()
                }["useVoice.useCallback[stopListening]"]);
                streamRef.current = null;
            }
            mediaRecorderRef.current = null;
            setIsListening(false);
        }
    }["useVoice.useCallback[stopListening]"], []);
    // Cleanup on unmount
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "useVoice.useEffect": ()=>{
            return ({
                "useVoice.useEffect": ()=>{
                    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
                        mediaRecorderRef.current.stop();
                    }
                    if (streamRef.current) {
                        streamRef.current.getTracks().forEach({
                            "useVoice.useEffect": (t)=>t.stop()
                        }["useVoice.useEffect"]);
                    }
                }
            })["useVoice.useEffect"];
        }
    }["useVoice.useEffect"], []);
    return {
        isListening,
        error,
        startListening,
        stopListening
    };
}
_s(useVoice, "tsJ6JE7how2zFvllTYmtVodCW2k=");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/hooks/useWebSocket.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useWebSocket",
    ()=>useWebSocket
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature();
"use client";
;
function useWebSocket(options) {
    _s();
    const { url, onMessage, maxRetries = 5, autoConnect = true } = options;
    const [isConnected, setIsConnected] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const wsRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const retriesRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(0);
    const reconnectTimerRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const intentionalCloseRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(false);
    const onMessageRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(onMessage);
    // Keep callback ref fresh without triggering reconnect
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "useWebSocket.useEffect": ()=>{
            onMessageRef.current = onMessage;
        }
    }["useWebSocket.useEffect"], [
        onMessage
    ]);
    const connect = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useWebSocket.useCallback[connect]": ()=>{
            // Cleanup previous connection
            if (wsRef.current) {
                intentionalCloseRef.current = true;
                wsRef.current.close();
            }
            intentionalCloseRef.current = false;
            setError(null);
            try {
                const ws = new WebSocket(url);
                ws.onopen = ({
                    "useWebSocket.useCallback[connect]": ()=>{
                        setIsConnected(true);
                        setError(null);
                        retriesRef.current = 0;
                    }
                })["useWebSocket.useCallback[connect]"];
                ws.onmessage = ({
                    "useWebSocket.useCallback[connect]": (event)=>{
                        try {
                            var _onMessageRef_current;
                            const data = typeof event.data === "string" ? JSON.parse(event.data) : event.data;
                            (_onMessageRef_current = onMessageRef.current) === null || _onMessageRef_current === void 0 ? void 0 : _onMessageRef_current.call(onMessageRef, data);
                        } catch (e) {
                            var // If not JSON, treat as plain text transcript
                            _onMessageRef_current1;
                            (_onMessageRef_current1 = onMessageRef.current) === null || _onMessageRef_current1 === void 0 ? void 0 : _onMessageRef_current1.call(onMessageRef, {
                                type: "transcript",
                                content: event.data,
                                role: "ai"
                            });
                        }
                    }
                })["useWebSocket.useCallback[connect]"];
                ws.onerror = ({
                    "useWebSocket.useCallback[connect]": ()=>{
                        setError("WebSocket connection error.");
                    }
                })["useWebSocket.useCallback[connect]"];
                ws.onclose = ({
                    "useWebSocket.useCallback[connect]": ()=>{
                        setIsConnected(false);
                        wsRef.current = null;
                        // Auto-reconnect unless intentionally closed
                        if (!intentionalCloseRef.current && retriesRef.current < maxRetries) {
                            const delay = Math.min(1000 * 2 ** retriesRef.current, 30000);
                            retriesRef.current += 1;
                            setError("Disconnected. Reconnecting in ".concat(Math.round(delay / 1000), "s…"));
                            reconnectTimerRef.current = setTimeout({
                                "useWebSocket.useCallback[connect]": ()=>{
                                    connect();
                                }
                            }["useWebSocket.useCallback[connect]"], delay);
                        } else if (retriesRef.current >= maxRetries) {
                            setError("Connection lost. Please refresh the page.");
                        }
                    }
                })["useWebSocket.useCallback[connect]"];
                wsRef.current = ws;
            } catch (e) {
                setError("Failed to create WebSocket connection.");
            }
        }
    }["useWebSocket.useCallback[connect]"], [
        url,
        maxRetries
    ]);
    const disconnect = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useWebSocket.useCallback[disconnect]": ()=>{
            intentionalCloseRef.current = true;
            if (reconnectTimerRef.current) {
                clearTimeout(reconnectTimerRef.current);
            }
            if (wsRef.current) {
                wsRef.current.close();
            }
            setIsConnected(false);
        }
    }["useWebSocket.useCallback[disconnect]"], []);
    const sendMessage = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useWebSocket.useCallback[sendMessage]": (data)=>{
            if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
                const payload = typeof data === "object" && !(data instanceof ArrayBuffer) ? JSON.stringify(data) : data;
                wsRef.current.send(payload);
            }
        }
    }["useWebSocket.useCallback[sendMessage]"], []);
    // Auto-connect on mount
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "useWebSocket.useEffect": ()=>{
            if (autoConnect) {
                connect();
            }
            return ({
                "useWebSocket.useEffect": ()=>{
                    disconnect();
                }
            })["useWebSocket.useEffect"];
        // eslint-disable-next-line react-hooks/exhaustive-deps
        }
    }["useWebSocket.useEffect"], []);
    return {
        isConnected,
        error,
        sendMessage,
        connect,
        disconnect
    };
}
_s(useWebSocket, "3XOfhCLSSSnxGpRGit7XI/tZ1/c=");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/hooks/useAudioPlayback.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useAudioPlayback",
    ()=>useAudioPlayback
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$audioUtils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/audioUtils.ts [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature();
"use client";
;
;
function useAudioPlayback() {
    _s();
    const [isPlaying, setIsPlaying] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const audioContextRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const nextStartTimeRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(0);
    const activeSourcesRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])([]);
    /** Lazily create or resume the AudioContext. */ const getContext = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useAudioPlayback.useCallback[getContext]": ()=>{
            if (!audioContextRef.current || audioContextRef.current.state === "closed") {
                audioContextRef.current = new AudioContext({
                    sampleRate: 24000
                });
            }
            if (audioContextRef.current.state === "suspended") {
                audioContextRef.current.resume();
            }
            return audioContextRef.current;
        }
    }["useAudioPlayback.useCallback[getContext]"], []);
    const enqueueAudio = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useAudioPlayback.useCallback[enqueueAudio]": async (base64Audio)=>{
            const ctx = getContext();
            const arrayBuffer = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$audioUtils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["base64ToArrayBuffer"])(base64Audio);
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
                source.onended = ({
                    "useAudioPlayback.useCallback[enqueueAudio]": ()=>{
                        activeSourcesRef.current = activeSourcesRef.current.filter({
                            "useAudioPlayback.useCallback[enqueueAudio]": (s)=>s !== source
                        }["useAudioPlayback.useCallback[enqueueAudio]"]);
                        if (activeSourcesRef.current.length === 0) {
                            setIsPlaying(false);
                        }
                    }
                })["useAudioPlayback.useCallback[enqueueAudio]"];
            } catch (e) {
                // Non-decodable chunk — skip silently
                console.warn("Could not decode audio chunk, skipping.");
            }
        }
    }["useAudioPlayback.useCallback[enqueueAudio]"], [
        getContext
    ]);
    const stopPlayback = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useAudioPlayback.useCallback[stopPlayback]": ()=>{
            activeSourcesRef.current.forEach({
                "useAudioPlayback.useCallback[stopPlayback]": (source)=>{
                    try {
                        source.stop();
                    } catch (e) {
                    /* already stopped */ }
                }
            }["useAudioPlayback.useCallback[stopPlayback]"]);
            activeSourcesRef.current = [];
            nextStartTimeRef.current = 0;
            setIsPlaying(false);
        }
    }["useAudioPlayback.useCallback[stopPlayback]"], []);
    return {
        isPlaying,
        enqueueAudio,
        stopPlayback
    };
}
_s(useAudioPlayback, "gH04/0q3LhAy0o2lVWOMn29gIA4=");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/voice/PulseAnimation.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>PulseAnimation
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
"use client";
;
function PulseAnimation(param) {
    let { isActive } = param;
    if (!isActive) return null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "absolute inset-0 flex items-center justify-center pointer-events-none",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute w-full h-full rounded-full bg-[var(--accent)]/15 animate-pulse-ring"
            }, void 0, false, {
                fileName: "[project]/src/components/voice/PulseAnimation.tsx",
                lineNumber: 16,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute w-full h-full rounded-full bg-[var(--accent)]/10 animate-pulse-ring-2"
            }, void 0, false, {
                fileName: "[project]/src/components/voice/PulseAnimation.tsx",
                lineNumber: 17,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
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
_c = PulseAnimation;
var _c;
__turbopack_context__.k.register(_c, "PulseAnimation");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/voice/MicButton.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>MicButton
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$voice$2f$PulseAnimation$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/voice/PulseAnimation.tsx [app-client] (ecmascript)");
"use client";
;
;
function MicButton(param) {
    let { isListening, disabled, error, onClick } = param;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "relative flex items-center justify-center",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute w-44 h-44",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$voice$2f$PulseAnimation$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
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
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                id: "mic-button",
                onClick: onClick,
                disabled: disabled,
                className: "\n          relative z-10 w-20 h-20 rounded-full\n          transition-all duration-500 ease-out\n          cursor-pointer\n          focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-primary)]\n          ".concat(isListening ? "bg-gradient-to-br from-amber-700 to-orange-900 animate-breathe scale-110" : "bg-[var(--bg-elevated)] hover:bg-[var(--bg-card)] hover:scale-105 border border-[var(--border-accent)]", "\n          ").concat(disabled ? "opacity-30 cursor-not-allowed" : "", "\n          ").concat(error ? "ring-1 ring-red-500/40" : "", "\n        "),
                "aria-label": isListening ? "Stop" : "Start",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: "block w-3 h-3 mx-auto rounded-full transition-all duration-500 ".concat(isListening ? "bg-white/90 scale-100" : "bg-[var(--text-tertiary)] scale-75")
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
            error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute -bottom-12 left-1/2 -translate-x-1/2 whitespace-nowrap animate-fade-in-up",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
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
_c = MicButton;
var _c;
__turbopack_context__.k.register(_c, "MicButton");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/voice/StatusIndicator.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>StatusIndicator
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
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
function StatusIndicator(param) {
    let { status, errorMessage } = param;
    const cfg = CONFIG[status];
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex items-center gap-2 text-sm font-medium tracking-widest uppercase ".concat(cfg.textClass, " transition-colors duration-500"),
        children: [
            status === "processing" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "flex gap-[3px]",
                children: [
                    0,
                    1,
                    2
                ].map((i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
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
            status === "speaking" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "flex items-center gap-[2px] h-4",
                children: [
                    0,
                    1,
                    2,
                    3,
                    4
                ].map((i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
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
            status !== "processing" && status !== "speaking" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "w-1.5 h-1.5 rounded-full ".concat(cfg.dotClass, " ").concat(status === "listening" ? "animate-pulse" : "")
            }, void 0, false, {
                fileName: "[project]/src/components/voice/StatusIndicator.tsx",
                lineNumber: 67,
                columnNumber: 17
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
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
_c = StatusIndicator;
var _c;
__turbopack_context__.k.register(_c, "StatusIndicator");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/voice/LiveTranscript.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>LiveTranscript
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
function LiveTranscript(param) {
    let { entries } = param;
    _s();
    const scrollRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "LiveTranscript.useEffect": ()=>{
            if (scrollRef.current) {
                scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
            }
        }
    }["LiveTranscript.useEffect"], [
        entries
    ]);
    if (entries.length === 0) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex-1 flex items-center justify-center",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "text-center space-y-3 select-none",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-[var(--text-secondary)] text-base font-medium",
                        children: "Tap the orb to begin a conversation"
                    }, void 0, false, {
                        fileName: "[project]/src/components/voice/LiveTranscript.tsx",
                        lineNumber: 33,
                        columnNumber: 21
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
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
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        ref: scrollRef,
        className: "flex-1 overflow-y-auto px-5 py-5 space-y-3 scroll-smooth",
        children: entries.map((entry)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex animate-fade-in-up ".concat(entry.role === "user" ? "justify-end" : "justify-start"),
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "\n              max-w-[75%] px-5 py-3.5 rounded-2xl text-[15px] leading-relaxed\n              ".concat(entry.role === "user" ? "bg-[var(--user-bubble)] text-[var(--text-primary)] rounded-br-sm" : "bg-[var(--ai-bubble)] text-[var(--text-secondary)] rounded-bl-sm border border-[var(--border-subtle)]", "\n            "),
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            children: entry.text
                        }, void 0, false, {
                            fileName: "[project]/src/components/voice/LiveTranscript.tsx",
                            lineNumber: 64,
                            columnNumber: 25
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
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
_s(LiveTranscript, "P14GFulhWAl/Oec4Pk4QeBwKyr0=");
_c = LiveTranscript;
var _c;
__turbopack_context__.k.register(_c, "LiveTranscript");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/voice/VoiceInterface.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>VoiceInterface
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useVoice$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/hooks/useVoice.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useWebSocket$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/hooks/useWebSocket.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useAudioPlayback$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/hooks/useAudioPlayback.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$voice$2f$MicButton$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/voice/MicButton.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$voice$2f$StatusIndicator$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/voice/StatusIndicator.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$voice$2f$LiveTranscript$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/voice/LiveTranscript.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
;
;
const WS_URL = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].env.NEXT_PUBLIC_WS_URL || "ws://localhost:8080/ws";
function VoiceInterface() {
    _s();
    const [status, setStatus] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("idle");
    const [transcript, setTranscript] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const statusRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(status);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "VoiceInterface.useEffect": ()=>{
            statusRef.current = status;
        }
    }["VoiceInterface.useEffect"], [
        status
    ]);
    // ── Audio Playback ──
    const { isPlaying, enqueueAudio, stopPlayback } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useAudioPlayback$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAudioPlayback"])();
    // ── WebSocket ──
    const handleWsMessage = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "VoiceInterface.useCallback[handleWsMessage]": (message)=>{
            switch(message.type){
                case "transcript":
                    if (message.content) {
                        setTranscript({
                            "VoiceInterface.useCallback[handleWsMessage]": (prev)=>[
                                    ...prev,
                                    {
                                        id: "".concat(Date.now(), "-").concat(Math.random().toString(36).slice(2, 7)),
                                        role: message.role || "ai",
                                        text: message.content,
                                        timestamp: new Date()
                                    }
                                ]
                        }["VoiceInterface.useCallback[handleWsMessage]"]);
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
        }
    }["VoiceInterface.useCallback[handleWsMessage]"], [
        enqueueAudio
    ]);
    const { isConnected, error: wsError, sendMessage } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useWebSocket$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useWebSocket"])({
        url: WS_URL,
        onMessage: handleWsMessage,
        autoConnect: true
    });
    // ── Voice (live streaming) ──
    const handleAudioChunk = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "VoiceInterface.useCallback[handleAudioChunk]": (base64)=>{
            sendMessage({
                type: "audio",
                audio: base64
            });
        }
    }["VoiceInterface.useCallback[handleAudioChunk]"], [
        sendMessage
    ]);
    const { isListening, error: micError, startListening, stopListening } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useVoice$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useVoice"])({
        onAudioChunk: handleAudioChunk
    });
    // ── Toggle live session ──
    const toggleSession = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "VoiceInterface.useCallback[toggleSession]": async ()=>{
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
        }
    }["VoiceInterface.useCallback[toggleSession]"], [
        isListening,
        startListening,
        stopListening,
        stopPlayback,
        sendMessage
    ]);
    // Derived: when AI finishes speaking, revert to listening if mic is on
    const effectiveStatus = status === "speaking" && !isPlaying ? isListening ? "listening" : "idle" : status;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "relative z-10 flex flex-col h-screen max-w-xl mx-auto",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
                className: "flex items-center justify-between px-6 py-5",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                        className: "text-base font-semibold tracking-tight text-[var(--text-secondary)]",
                        children: "voice"
                    }, void 0, false, {
                        fileName: "[project]/src/components/voice/VoiceInterface.tsx",
                        lineNumber: 133,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-2",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "\n              w-2 h-2 rounded-full transition-colors duration-500\n              ".concat(isConnected ? "bg-[var(--success)] text-[var(--success)] animate-glow-pulse" : "bg-[var(--error)] text-[var(--error)] animate-glow-pulse", "\n            ")
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
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$voice$2f$LiveTranscript$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                entries: transcript
            }, void 0, false, {
                fileName: "[project]/src/components/voice/VoiceInterface.tsx",
                lineNumber: 152,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex flex-col items-center gap-6 px-6 pt-6 pb-10",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$voice$2f$StatusIndicator$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                        status: effectiveStatus,
                        errorMessage: wsError || micError
                    }, void 0, false, {
                        fileName: "[project]/src/components/voice/VoiceInterface.tsx",
                        lineNumber: 156,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$voice$2f$MicButton$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                        isListening: isListening,
                        error: micError,
                        onClick: toggleSession
                    }, void 0, false, {
                        fileName: "[project]/src/components/voice/VoiceInterface.tsx",
                        lineNumber: 161,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
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
_s(VoiceInterface, "uCwmq5QuE8zOtAKAU+DAM0QUKIo=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useAudioPlayback$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAudioPlayback"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useWebSocket$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useWebSocket"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useVoice$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useVoice"]
    ];
});
_c = VoiceInterface;
var _c;
__turbopack_context__.k.register(_c, "VoiceInterface");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/hooks/useSpeechToText.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useSpeechToText",
    ()=>useSpeechToText
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature();
"use client";
;
function useSpeechToText() {
    let options = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    _s();
    const { lang = "en-US" } = options;
    const [isListening, setIsListening] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [transcript, setTranscript] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [interimTranscript, setInterimTranscript] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    // Stable refs so callbacks never go stale in event handlers
    const recognitionRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const isListeningRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(false);
    const transcriptRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])("");
    // Keep refs in sync with state
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "useSpeechToText.useEffect": ()=>{
            isListeningRef.current = isListening;
        }
    }["useSpeechToText.useEffect"], [
        isListening
    ]);
    /** Resolve the correct constructor — standard or webkit-prefixed. */ const getRecognitionConstructor = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useSpeechToText.useCallback[getRecognitionConstructor]": ()=>{
            if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
            ;
            var _window_SpeechRecognition;
            return (_window_SpeechRecognition = window.SpeechRecognition) !== null && _window_SpeechRecognition !== void 0 ? _window_SpeechRecognition : window.webkitSpeechRecognition;
        }
    }["useSpeechToText.useCallback[getRecognitionConstructor]"], []);
    /** Build a fresh SpeechRecognition instance with all handlers wired up. */ const buildRecognition = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useSpeechToText.useCallback[buildRecognition]": ()=>{
            const SpeechRecognitionImpl = getRecognitionConstructor();
            if (!SpeechRecognitionImpl) return null;
            const recognition = new SpeechRecognitionImpl();
            recognition.continuous = true; // Don't stop after a single phrase
            recognition.interimResults = true; // Surface partial results in real-time
            recognition.lang = lang;
            recognition.onstart = ({
                "useSpeechToText.useCallback[buildRecognition]": ()=>{
                    setError(null);
                }
            })["useSpeechToText.useCallback[buildRecognition]"];
            recognition.onresult = ({
                "useSpeechToText.useCallback[buildRecognition]": (event)=>{
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
                }
            })["useSpeechToText.useCallback[buildRecognition]"];
            recognition.onerror = ({
                "useSpeechToText.useCallback[buildRecognition]": (event)=>{
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
                }
            })["useSpeechToText.useCallback[buildRecognition]"];
            /**
         * Auto-restart on end:
         * The Web Speech API stops spontaneously after speech pauses or timeouts.
         * We re-call `start()` immediately if we still *want* to be listening,
         * creating a seamless, persistent "live" experience.
         */ recognition.onend = ({
                "useSpeechToText.useCallback[buildRecognition]": ()=>{
                    setInterimTranscript(""); // Clear any leftover interim on each restart
                    if (isListeningRef.current) {
                        try {
                            recognition.start();
                        } catch (e) {
                        // If the instance is already started (race condition), ignore.
                        }
                    }
                }
            })["useSpeechToText.useCallback[buildRecognition]"];
            return recognition;
        }
    }["useSpeechToText.useCallback[buildRecognition]"], [
        getRecognitionConstructor,
        lang
    ]);
    const startListening = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useSpeechToText.useCallback[startListening]": ()=>{
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
            } catch (e) {
                setError("unknown");
                setIsListening(false);
                isListeningRef.current = false;
            }
        }
    }["useSpeechToText.useCallback[startListening]"], [
        getRecognitionConstructor,
        buildRecognition
    ]);
    const stopListening = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useSpeechToText.useCallback[stopListening]": ()=>{
            isListeningRef.current = false;
            setIsListening(false);
            setInterimTranscript("");
            if (recognitionRef.current) {
                recognitionRef.current.stop(); // Graceful stop (flushes final result)
                recognitionRef.current = null;
            }
        }
    }["useSpeechToText.useCallback[stopListening]"], []);
    const resetTranscript = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useSpeechToText.useCallback[resetTranscript]": ()=>{
            transcriptRef.current = "";
            setTranscript("");
            setInterimTranscript("");
        }
    }["useSpeechToText.useCallback[resetTranscript]"], []);
    // Cleanup on unmount — release the mic immediately
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "useSpeechToText.useEffect": ()=>{
            return ({
                "useSpeechToText.useEffect": ()=>{
                    if (recognitionRef.current) {
                        isListeningRef.current = false;
                        recognitionRef.current.abort();
                        recognitionRef.current = null;
                    }
                }
            })["useSpeechToText.useEffect"];
        }
    }["useSpeechToText.useEffect"], []);
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
_s(useSpeechToText, "HVMc+m8Y4dKVvTrSvFYHF3trl2E=");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/voice/VoiceInput.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>VoiceInput
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useSpeechToText$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/hooks/useSpeechToText.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
const ERROR_MESSAGES = {
    "not-supported": "Your browser doesn't support speech recognition. Try Chrome or Edge.",
    "not-allowed": "Microphone access was denied. Please allow it in your browser settings.",
    "no-speech": "No speech detected. Please try speaking again.",
    network: "Network error. Check your connection and try again.",
    unknown: "An unexpected error occurred. Please try again."
};
function VoiceInput() {
    _s();
    const { isListening, transcript, interimTranscript, error, startListening, stopListening, resetTranscript } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useSpeechToText$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSpeechToText"])({
        lang: "en-US"
    });
    const isEmpty = !transcript && !interimTranscript;
    var _ERROR_MESSAGES_error;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
        className: "relative z-10 w-full max-w-xl mx-auto px-6 pb-10",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center gap-3 mb-8",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex-1 h-px bg-[var(--border-accent)]"
                    }, void 0, false, {
                        fileName: "[project]/src/components/voice/VoiceInput.tsx",
                        lineNumber: 37,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-[11px] text-[var(--text-tertiary)] uppercase tracking-widest select-none",
                        children: "speech capture"
                    }, void 0, false, {
                        fileName: "[project]/src/components/voice/VoiceInput.tsx",
                        lineNumber: 38,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
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
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "\n          relative w-full min-h-[120px] rounded-2xl px-5 py-4 mb-6\n          border transition-all duration-300\n          ".concat(isListening ? "border-[var(--accent)]/40 bg-[var(--bg-elevated)]" : "border-[var(--border-subtle)] bg-[var(--bg-card)]", "\n        "),
                children: [
                    isListening && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "absolute top-3 right-3 flex h-2.5 w-2.5",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75 animate-ping"
                            }, void 0, false, {
                                fileName: "[project]/src/components/voice/VoiceInput.tsx",
                                lineNumber: 58,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
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
                    isEmpty && !isListening && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-base text-[var(--text-tertiary)] font-light select-none",
                        children: "Tap the button below and start speaking..."
                    }, void 0, false, {
                        fileName: "[project]/src/components/voice/VoiceInput.tsx",
                        lineNumber: 65,
                        columnNumber: 21
                    }, this),
                    isEmpty && isListening && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-base text-[var(--text-tertiary)] italic animate-pulse select-none",
                        children: "Listening..."
                    }, void 0, false, {
                        fileName: "[project]/src/components/voice/VoiceInput.tsx",
                        lineNumber: 71,
                        columnNumber: 21
                    }, this),
                    !isEmpty && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-base leading-relaxed font-light",
                        children: [
                            transcript && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
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
                            interimTranscript && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
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
            error && error !== "no-speech" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mb-5 px-4 py-3 rounded-xl bg-[var(--error)]/10 border border-[var(--error)]/20 animate-fade-in-up",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "text-sm text-[var(--error)]",
                    children: (_ERROR_MESSAGES_error = ERROR_MESSAGES[error]) !== null && _ERROR_MESSAGES_error !== void 0 ? _ERROR_MESSAGES_error : ERROR_MESSAGES.unknown
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
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center gap-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        id: "voice-record-button",
                        onClick: isListening ? stopListening : startListening,
                        className: "\n            relative flex items-center justify-center gap-2.5\n            px-5 py-3 rounded-full text-sm font-medium\n            transition-all duration-300 ease-out select-none\n            focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]/40\n            ".concat(isListening ? "bg-red-500/95 hover:bg-red-600 text-white" : "bg-[var(--accent)] hover:opacity-90 text-white", "\n          "),
                        "aria-label": isListening ? "Stop recording" : "Start recording",
                        children: [
                            isListening && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "absolute inset-0 rounded-full border-2 border-red-400 opacity-60 animate-pulse-ring pointer-events-none"
                            }, void 0, false, {
                                fileName: "[project]/src/components/voice/VoiceInput.tsx",
                                lineNumber: 125,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "\n              flex-shrink-0 w-2.5 h-2.5 rounded-full transition-all duration-300\n              ".concat(isListening ? "bg-white animate-pulse" : "bg-white/80", "\n            ")
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
                    (transcript || interimTranscript) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
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
                    !isEmpty && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
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
_s(VoiceInput, "rVlNPcmKdXxJ9R160vxBxqHOojk=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useSpeechToText$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSpeechToText"]
    ];
});
_c = VoiceInput;
var _c;
__turbopack_context__.k.register(_c, "VoiceInput");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/node_modules/next/dist/compiled/react/cjs/react-jsx-dev-runtime.development.js [app-client] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/**
 * @license React
 * react-jsx-dev-runtime.development.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
"use strict";
"production" !== ("TURBOPACK compile-time value", "development") && function() {
    function getComponentNameFromType(type) {
        if (null == type) return null;
        if ("function" === typeof type) return type.$$typeof === REACT_CLIENT_REFERENCE ? null : type.displayName || type.name || null;
        if ("string" === typeof type) return type;
        switch(type){
            case REACT_FRAGMENT_TYPE:
                return "Fragment";
            case REACT_PROFILER_TYPE:
                return "Profiler";
            case REACT_STRICT_MODE_TYPE:
                return "StrictMode";
            case REACT_SUSPENSE_TYPE:
                return "Suspense";
            case REACT_SUSPENSE_LIST_TYPE:
                return "SuspenseList";
            case REACT_ACTIVITY_TYPE:
                return "Activity";
        }
        if ("object" === typeof type) switch("number" === typeof type.tag && console.error("Received an unexpected object in getComponentNameFromType(). This is likely a bug in React. Please file an issue."), type.$$typeof){
            case REACT_PORTAL_TYPE:
                return "Portal";
            case REACT_CONTEXT_TYPE:
                return type.displayName || "Context";
            case REACT_CONSUMER_TYPE:
                return (type._context.displayName || "Context") + ".Consumer";
            case REACT_FORWARD_REF_TYPE:
                var innerType = type.render;
                type = type.displayName;
                type || (type = innerType.displayName || innerType.name || "", type = "" !== type ? "ForwardRef(" + type + ")" : "ForwardRef");
                return type;
            case REACT_MEMO_TYPE:
                return innerType = type.displayName || null, null !== innerType ? innerType : getComponentNameFromType(type.type) || "Memo";
            case REACT_LAZY_TYPE:
                innerType = type._payload;
                type = type._init;
                try {
                    return getComponentNameFromType(type(innerType));
                } catch (x) {}
        }
        return null;
    }
    function testStringCoercion(value) {
        return "" + value;
    }
    function checkKeyStringCoercion(value) {
        try {
            testStringCoercion(value);
            var JSCompiler_inline_result = !1;
        } catch (e) {
            JSCompiler_inline_result = !0;
        }
        if (JSCompiler_inline_result) {
            JSCompiler_inline_result = console;
            var JSCompiler_temp_const = JSCompiler_inline_result.error;
            var JSCompiler_inline_result$jscomp$0 = "function" === typeof Symbol && Symbol.toStringTag && value[Symbol.toStringTag] || value.constructor.name || "Object";
            JSCompiler_temp_const.call(JSCompiler_inline_result, "The provided key is an unsupported type %s. This value must be coerced to a string before using it here.", JSCompiler_inline_result$jscomp$0);
            return testStringCoercion(value);
        }
    }
    function getTaskName(type) {
        if (type === REACT_FRAGMENT_TYPE) return "<>";
        if ("object" === typeof type && null !== type && type.$$typeof === REACT_LAZY_TYPE) return "<...>";
        try {
            var name = getComponentNameFromType(type);
            return name ? "<" + name + ">" : "<...>";
        } catch (x) {
            return "<...>";
        }
    }
    function getOwner() {
        var dispatcher = ReactSharedInternals.A;
        return null === dispatcher ? null : dispatcher.getOwner();
    }
    function UnknownOwner() {
        return Error("react-stack-top-frame");
    }
    function hasValidKey(config) {
        if (hasOwnProperty.call(config, "key")) {
            var getter = Object.getOwnPropertyDescriptor(config, "key").get;
            if (getter && getter.isReactWarning) return !1;
        }
        return void 0 !== config.key;
    }
    function defineKeyPropWarningGetter(props, displayName) {
        function warnAboutAccessingKey() {
            specialPropKeyWarningShown || (specialPropKeyWarningShown = !0, console.error("%s: `key` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://react.dev/link/special-props)", displayName));
        }
        warnAboutAccessingKey.isReactWarning = !0;
        Object.defineProperty(props, "key", {
            get: warnAboutAccessingKey,
            configurable: !0
        });
    }
    function elementRefGetterWithDeprecationWarning() {
        var componentName = getComponentNameFromType(this.type);
        didWarnAboutElementRef[componentName] || (didWarnAboutElementRef[componentName] = !0, console.error("Accessing element.ref was removed in React 19. ref is now a regular prop. It will be removed from the JSX Element type in a future release."));
        componentName = this.props.ref;
        return void 0 !== componentName ? componentName : null;
    }
    function ReactElement(type, key, props, owner, debugStack, debugTask) {
        var refProp = props.ref;
        type = {
            $$typeof: REACT_ELEMENT_TYPE,
            type: type,
            key: key,
            props: props,
            _owner: owner
        };
        null !== (void 0 !== refProp ? refProp : null) ? Object.defineProperty(type, "ref", {
            enumerable: !1,
            get: elementRefGetterWithDeprecationWarning
        }) : Object.defineProperty(type, "ref", {
            enumerable: !1,
            value: null
        });
        type._store = {};
        Object.defineProperty(type._store, "validated", {
            configurable: !1,
            enumerable: !1,
            writable: !0,
            value: 0
        });
        Object.defineProperty(type, "_debugInfo", {
            configurable: !1,
            enumerable: !1,
            writable: !0,
            value: null
        });
        Object.defineProperty(type, "_debugStack", {
            configurable: !1,
            enumerable: !1,
            writable: !0,
            value: debugStack
        });
        Object.defineProperty(type, "_debugTask", {
            configurable: !1,
            enumerable: !1,
            writable: !0,
            value: debugTask
        });
        Object.freeze && (Object.freeze(type.props), Object.freeze(type));
        return type;
    }
    function jsxDEVImpl(type, config, maybeKey, isStaticChildren, debugStack, debugTask) {
        var children = config.children;
        if (void 0 !== children) if (isStaticChildren) if (isArrayImpl(children)) {
            for(isStaticChildren = 0; isStaticChildren < children.length; isStaticChildren++)validateChildKeys(children[isStaticChildren]);
            Object.freeze && Object.freeze(children);
        } else console.error("React.jsx: Static children should always be an array. You are likely explicitly calling React.jsxs or React.jsxDEV. Use the Babel transform instead.");
        else validateChildKeys(children);
        if (hasOwnProperty.call(config, "key")) {
            children = getComponentNameFromType(type);
            var keys = Object.keys(config).filter(function(k) {
                return "key" !== k;
            });
            isStaticChildren = 0 < keys.length ? "{key: someKey, " + keys.join(": ..., ") + ": ...}" : "{key: someKey}";
            didWarnAboutKeySpread[children + isStaticChildren] || (keys = 0 < keys.length ? "{" + keys.join(": ..., ") + ": ...}" : "{}", console.error('A props object containing a "key" prop is being spread into JSX:\n  let props = %s;\n  <%s {...props} />\nReact keys must be passed directly to JSX without using spread:\n  let props = %s;\n  <%s key={someKey} {...props} />', isStaticChildren, children, keys, children), didWarnAboutKeySpread[children + isStaticChildren] = !0);
        }
        children = null;
        void 0 !== maybeKey && (checkKeyStringCoercion(maybeKey), children = "" + maybeKey);
        hasValidKey(config) && (checkKeyStringCoercion(config.key), children = "" + config.key);
        if ("key" in config) {
            maybeKey = {};
            for(var propName in config)"key" !== propName && (maybeKey[propName] = config[propName]);
        } else maybeKey = config;
        children && defineKeyPropWarningGetter(maybeKey, "function" === typeof type ? type.displayName || type.name || "Unknown" : type);
        return ReactElement(type, children, maybeKey, getOwner(), debugStack, debugTask);
    }
    function validateChildKeys(node) {
        "object" === typeof node && null !== node && node.$$typeof === REACT_ELEMENT_TYPE && node._store && (node._store.validated = 1);
    }
    var React = __turbopack_context__.r("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)"), REACT_ELEMENT_TYPE = Symbol.for("react.transitional.element"), REACT_PORTAL_TYPE = Symbol.for("react.portal"), REACT_FRAGMENT_TYPE = Symbol.for("react.fragment"), REACT_STRICT_MODE_TYPE = Symbol.for("react.strict_mode"), REACT_PROFILER_TYPE = Symbol.for("react.profiler"), REACT_CONSUMER_TYPE = Symbol.for("react.consumer"), REACT_CONTEXT_TYPE = Symbol.for("react.context"), REACT_FORWARD_REF_TYPE = Symbol.for("react.forward_ref"), REACT_SUSPENSE_TYPE = Symbol.for("react.suspense"), REACT_SUSPENSE_LIST_TYPE = Symbol.for("react.suspense_list"), REACT_MEMO_TYPE = Symbol.for("react.memo"), REACT_LAZY_TYPE = Symbol.for("react.lazy"), REACT_ACTIVITY_TYPE = Symbol.for("react.activity"), REACT_CLIENT_REFERENCE = Symbol.for("react.client.reference"), ReactSharedInternals = React.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE, hasOwnProperty = Object.prototype.hasOwnProperty, isArrayImpl = Array.isArray, createTask = console.createTask ? console.createTask : function() {
        return null;
    };
    React = {
        react_stack_bottom_frame: function(callStackForError) {
            return callStackForError();
        }
    };
    var specialPropKeyWarningShown;
    var didWarnAboutElementRef = {};
    var unknownOwnerDebugStack = React.react_stack_bottom_frame.bind(React, UnknownOwner)();
    var unknownOwnerDebugTask = createTask(getTaskName(UnknownOwner));
    var didWarnAboutKeySpread = {};
    exports.Fragment = REACT_FRAGMENT_TYPE;
    exports.jsxDEV = function(type, config, maybeKey, isStaticChildren) {
        var trackActualOwner = 1e4 > ReactSharedInternals.recentlyCreatedOwnerStacks++;
        return jsxDEVImpl(type, config, maybeKey, isStaticChildren, trackActualOwner ? Error("react-stack-top-frame") : unknownOwnerDebugStack, trackActualOwner ? createTask(getTaskName(type)) : unknownOwnerDebugTask);
    };
}();
}),
"[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
'use strict';
if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
;
else {
    module.exports = __turbopack_context__.r("[project]/node_modules/next/dist/compiled/react/cjs/react-jsx-dev-runtime.development.js [app-client] (ecmascript)");
}
}),
]);

//# sourceMappingURL=_4a284366._.js.map