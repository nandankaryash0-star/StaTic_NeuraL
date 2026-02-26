/**
 * Global type declarations for the Web Speech API.
 *
 * Available in Chrome/Edge via `window.webkitSpeechRecognition` and in
 * standards-compliant browsers via `window.SpeechRecognition`.
 *
 * NOTE: Do NOT add `export {}` here — this file must be a pure script
 * (not an ES module) for `declare global` to augment the global scope.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

interface SpeechRecognitionEvent extends Event {
    readonly resultIndex: number;
    readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
    readonly error: string;
    readonly message: string;
}

interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    maxAlternatives: number;

    start(): void;
    stop(): void;
    abort(): void;

    onstart: ((ev: Event) => void) | null;
    onend: ((ev: Event) => void) | null;
    onresult: ((ev: SpeechRecognitionEvent) => void) | null;
    onerror: ((ev: SpeechRecognitionErrorEvent) => void) | null;
    onspeechend: ((ev: Event) => void) | null;
}

interface SpeechRecognitionStatic {
    new(): SpeechRecognition;
}

interface Window {
    SpeechRecognition: SpeechRecognitionStatic | undefined;
    webkitSpeechRecognition: SpeechRecognitionStatic | undefined;
}
