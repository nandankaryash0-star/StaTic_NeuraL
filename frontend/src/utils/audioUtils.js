/**
 * Utility function to convert ElevenLabs audio format to AudioBuffer
 * for use with TalkingHead's speakAudio method
 */

/**
 * Process ElevenLabs audio message and prepare it for TalkingHead
 * @param {Object} message - ElevenLabs message object
 * @param {AudioContext} audioContext - Web Audio API context
 * @returns {Promise<Object>} - Formatted audio data for TalkingHead
 */
export async function processElevenLabsAudio(message, audioContext) {
    let audioBuffer = null;

    // Handle different audio formats
    if (message.audio) {
        if (message.audio instanceof ArrayBuffer) {
            audioBuffer = await audioContext.decodeAudioData(message.audio);
        } else if (message.audio instanceof AudioBuffer) {
            audioBuffer = message.audio;
        } else if (typeof message.audio === 'string') {
            // Base64 encoded audio
            const audioData = atob(message.audio);
            const arrayBuffer = new ArrayBuffer(audioData.length);
            const view = new Uint8Array(arrayBuffer);
            for (let i = 0; i < audioData.length; i++) {
                view[i] = audioData.charCodeAt(i);
            }
            audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        }
    }

    return {
        audio: audioBuffer,
        words: message.words || [],
        wtimes: message.wtimes || [],
        wdurations: message.wdurations || [],
        visemes: message.visemes || [],
        vtimes: message.vtimes || [],
        vdurations: message.vdurations || [],
        phonemes: message.phonemes || [],
        audioEncoding: message.audioEncoding || 'wav'
    };
}

/**
 * Map emotion tags to avatar moods
 * @param {string} emotion - Emotion tag from ElevenLabs or backend
 * @returns {string} - Avatar mood compatible with TalkingHead
 */
export function mapEmotionToMood(emotion) {
    const moodMap = {
        'happy': 'happy',
        'sad': 'sad',
        'angry': 'angry',
        'surprised': 'happy', // TalkingHead doesn't have surprised, use happy
        'neutral': 'neutral',
        'fear': 'fear',
        'disgust': 'disgust',
        'love': 'love'
    };

    return moodMap[emotion?.toLowerCase()] || 'neutral';
}

/**
 * Create synthetic viseme data from audio analysis when ElevenLabs doesn't provide it
 * This is a simplified fallback - real viseme generation requires phoneme alignment
 * @param {AudioBuffer} audioBuffer - Audio buffer to analyze
 * @param {number} duration - Duration in milliseconds
 * @returns {Object} - Synthetic viseme data
 */
export function createSyntheticVisemes(audioBuffer, duration) {
    // This is a very basic implementation
    // In practice, you'd need proper phoneme detection
    const frameRate = 40; // 40 FPS
    const frameCount = Math.ceil(duration / 1000 * frameRate);

    const visemes = [];
    const vtimes = [];
    const vdurations = [];

    // Simple pattern: alternate between mouth shapes based on audio volume
    const frameDuration = 1000 / frameRate;

    for (let i = 0; i < frameCount; i++) {
        const time = i * frameDuration;
        vtimes.push(time);
        vdurations.push(frameDuration);

        // Cycle through common visemes for a speaking pattern
        const visemePattern = ['aa', 'E', 'I', 'sil', 'PP', 'aa', 'O', 'sil'];
        visemes.push(visemePattern[i % visemePattern.length]);
    }

    return { visemes, vtimes, vdurations };
}

/**
 * Check if ElevenLabs message contains viseme data
 * @param {Object} message - ElevenLabs message
 * @returns {boolean}
 */
export function hasVisemeData(message) {
    return !!(message.visemes && message.visemes.length > 0);
}
