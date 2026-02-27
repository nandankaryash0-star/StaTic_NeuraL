import { useEffect, useState, useCallback, useRef } from 'react';
import { useConversation } from '@11labs/react';

export function useElevenLabs() {
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [lipData, setLipData] = useState({ value: 0 }); // 0 to 1 for mouth open

    // Refs for audio analysis
    const audioContext = useRef(null);
    const analyser = useRef(null);
    const dataArray = useRef(null);
    const source = useRef(null);
    const animationFrame = useRef(null);

    // 1. SETUP THE ANALYZER (To make lips move with audio)
    const setupAnalyzer = useCallback((stream) => {
        if (!audioContext.current) {
            audioContext.current = new (window.AudioContext || window.webkitAudioContext)();
        }

        // Close old context if needed (reset)
        if (audioContext.current.state === 'suspended') {
            audioContext.current.resume();
        }

        const ctx = audioContext.current;
        analyser.current = ctx.createAnalyser();
        analyser.current.fftSize = 256; // Smaller FFT for faster reaction

        source.current = ctx.createMediaStreamSource(stream);
        source.current.connect(analyser.current);
        // Note: In some browsers, we might need to connect to destination to hear it, 
        // but the SDK usually plays it via an Audio element.

        dataArray.current = new Uint8Array(analyser.current.frequencyBinCount);

        const analyze = () => {
            if (!analyser.current) return;
            analyser.current.getByteFrequencyData(dataArray.current);

            // Get volume average of lower frequencies (voice range)
            let sum = 0;
            const count = 10; // First 10 bins
            for (let i = 0; i < count; i++) {
                sum += dataArray.current[i];
            }
            const avg = sum / count;

            // Normalize (0 - 255) -> (0.0 - 1.0)
            // We scale it up (avg / 50) to make mouth more responsive
            const val = Math.min(1, avg / 60);

            setLipData({ value: val });

            if (isSpeaking) {
                animationFrame.current = requestAnimationFrame(analyze);
            } else {
                setLipData({ value: 0 }); // Close mouth when done
            }
        };
        analyze();
    }, [isSpeaking]);


    // 2. USE THE SDK HOOK
    const conversation = useConversation({
        onConnect: () => console.log('✅ Connected to ElevenLabs'),
        onDisconnect: () => console.log('❌ Disconnected'),
        onMessage: (message) => console.log('📩 Message:', message),
        onError: (error) => console.error('⚠️ Error:', error),

        // When the agent starts talking
        onModeChange: (mode) => {
            if (mode.mode === 'speaking') {
                setIsSpeaking(true);
            } else {
                setIsSpeaking(false);
            }
        }
    });

    // 3. CAPTURE AUDIO STREAM FOR LIP SYNC
    // The SDK doesn't expose the stream directly in the hook easily,
    // So we often have to "hack" it by finding the audio element it creates
    // or just relying on the visualizer state provided by the SDK? 
    // actually, the SDK provides `startSession` which takes a Signed URL.

    // SIMPLER METHOD FOR V1:
    // We will pass the connection details to the UI.

    return {
        conversation,
        isSpeaking,
        lipData
    };
}