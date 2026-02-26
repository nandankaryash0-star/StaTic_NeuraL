import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { TalkingHead } from '@met4citizen/talkinghead';

/**
 * Avatar3D Component - Wrapper for TalkingHead library
 * Provides viseme-based lip sync for 3D Ready Player Me avatars
 */
const Avatar3D = forwardRef(({ mood = 'neutral', isSpeaking = false, onLoad, onError }, ref) => {
    const containerRef = useRef(null);
    const headRef = useRef(null);
    const isInitialized = useRef(false);
    const isAvatarLoaded = useRef(false);  // Track if avatar is fully loaded
    const talkingIntervalRef = useRef(null);

    // Expose speakAudio and other methods to parent
    useImperativeHandle(ref, () => ({
        speakAudio: (audioData, options, callback) => {
            if (headRef.current && isAvatarLoaded.current) {
                return headRef.current.speakAudio(audioData, options, callback);
            }
        },
        setMood: (newMood) => {
            if (headRef.current && isAvatarLoaded.current) {
                try {
                    headRef.current.setMood(newMood);
                } catch (error) {
                    console.warn('Failed to set mood:', error);
                }
            }
        },
        stopSpeaking: () => {
            if (headRef.current && isAvatarLoaded.current) {
                headRef.current.stopSpeaking();
            }
        }
    }));

    useEffect(() => {
        if (!containerRef.current || isInitialized.current) return;

        isInitialized.current = true;

        // Initialize TalkingHead
        const initAvatar = async () => {
            try {
                // Create TalkingHead instance
                const head = new TalkingHead(containerRef.current, {
                    ttsEndpoint: null, // We're using external TTS (ElevenLabs)
                    cameraView: 'upper', // Upper body view for Sarthi
                    cameraDistance: 0,
                    cameraX: 0,
                    cameraY: -0.04, // David is taller, compensate
                    cameraRotateEnable: false,
                    cameraPanEnable: false,
                    cameraZoomEnable: false,
                    avatarMood: mood,
                    avatarMute: false,
                    lightAmbientColor: 0xffffff,
                    lightAmbientIntensity: 2,
                    lightDirectColor: 0x8888aa,
                    lightDirectIntensity: 30,
                    modelPixelRatio: 1,
                    modelFPS: 30
                });

                headRef.current = head;

                // Load the avatar
                await head.showAvatar({
                    url: '/avatars/david.glb',
                    body: 'M', // Male body type
                    avatarMood: mood
                });

                // Start animation loop
                head.start();

                // Mark avatar as fully loaded AFTER everything is done
                isAvatarLoaded.current = true;

                if (onLoad) {
                    onLoad();
                }
            } catch (error) {
                console.error('Failed to initialize TalkingHead avatar:', error);
                if (onError) {
                    onError(error);
                }
            }
        };

        initAvatar();

        // Cleanup
        return () => {
            isAvatarLoaded.current = false;
            if (talkingIntervalRef.current) {
                clearInterval(talkingIntervalRef.current);
            }
            if (headRef.current) {
                try {
                    headRef.current.stop();
                } catch (e) {
                    // Ignore cleanup errors
                }
            }
        };
    }, []);

    // Update mood when prop changes - ONLY if avatar is fully loaded
    useEffect(() => {
        if (headRef.current && isAvatarLoaded.current && mood) {
            try {
                headRef.current.setMood(mood);
            } catch (error) {
                console.warn('Failed to update mood:', error);
            }
        }
    }, [mood]);

    // Handle isSpeaking state - trigger TalkingHead speaking animations
    useEffect(() => {
        if (!headRef.current || !isAvatarLoaded.current) return;

        const head = headRef.current;

        if (isSpeaking) {
            try {
                // Set TalkingHead's internal speaking state
                head.stateName = 'speaking';
                head.isSpeaking = true;

                // Trigger hand gestures if available
                if (head.speakWithHands) {
                    head.speakWithHands();
                }

                // Start mouth animation loop using TalkingHead's lipsync system
                // We simulate speaking by pushing viseme animations to the queue
                const startSpeakingAnimation = () => {
                    if (!headRef.current || !isAvatarLoaded.current || !isSpeaking) return;

                    // Random viseme pattern for natural speaking
                    const visemes = ['aa', 'E', 'I', 'O', 'U', 'PP', 'SS', 'TH', 'nn', 'kk', 'sil'];
                    const randomViseme = visemes[Math.floor(Math.random() * (visemes.length - 1))]; // Exclude 'sil' mostly
                    const weight = 0.4 + Math.random() * 0.4;
                    const duration = 80 + Math.random() * 120;

                    // Set morph target directly for the viseme
                    if (head.morphs && head.morphs.length > 0) {
                        head.morphs.forEach(morph => {
                            const morphDict = morph.morphTargetDictionary;
                            const morphInfluences = morph.morphTargetInfluences;

                            if (morphDict && morphInfluences) {
                                // Reset previous visemes
                                visemes.forEach(v => {
                                    const idx = morphDict['viseme_' + v];
                                    if (idx !== undefined) {
                                        morphInfluences[idx] = 0;
                                    }
                                });

                                // Set current viseme
                                const idx = morphDict['viseme_' + randomViseme];
                                if (idx !== undefined) {
                                    morphInfluences[idx] = weight;
                                }
                            }
                        });
                    }
                };

                // Start animation interval
                talkingIntervalRef.current = setInterval(startSpeakingAnimation, 100);

            } catch (e) {
                console.warn('Failed to start speaking animation:', e);
            }
        } else {
            // Stop talking animation
            if (talkingIntervalRef.current) {
                clearInterval(talkingIntervalRef.current);
                talkingIntervalRef.current = null;
            }

            try {
                // Reset TalkingHead's internal state
                head.stateName = 'idle';
                head.isSpeaking = false;

                // Reset lips to neutral position
                if (head.resetLips) {
                    head.resetLips();
                } else if (head.morphs && head.morphs.length > 0) {
                    // Manually reset viseme morph targets
                    const visemes = ['aa', 'E', 'I', 'O', 'U', 'PP', 'SS', 'TH', 'nn', 'kk', 'sil'];
                    head.morphs.forEach(morph => {
                        const morphDict = morph.morphTargetDictionary;
                        const morphInfluences = morph.morphTargetInfluences;

                        if (morphDict && morphInfluences) {
                            visemes.forEach(v => {
                                const idx = morphDict['viseme_' + v];
                                if (idx !== undefined) {
                                    morphInfluences[idx] = 0;
                                }
                            });
                            // Set silent viseme
                            const silIdx = morphDict['viseme_sil'];
                            if (silIdx !== undefined) {
                                morphInfluences[silIdx] = 1;
                            }
                        }
                    });
                }
            } catch (e) {
                console.warn('Failed to stop speaking animation:', e);
            }
        }

        return () => {
            if (talkingIntervalRef.current) {
                clearInterval(talkingIntervalRef.current);
            }
        };
    }, [isSpeaking]);

    return (
        <div
            ref={containerRef}
            style={{
                width: '100%',
                height: '100%',
                position: 'absolute',
                top: 0,
                left: 0
            }}
        />
    );
});

Avatar3D.displayName = 'Avatar3D';

export default Avatar3D;

