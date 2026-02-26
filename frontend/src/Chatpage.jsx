import React, { useState, useRef, useEffect, useCallback } from "react";
import { Mic, Square } from "lucide-react";
import { useConversation } from '@elevenlabs/react';
import Avatar3D from "./components/Avatar3D";

// Persona configuration with new immersive design
// Personas moved inside component to ensure env vars are picked up correctly

export default function ChatPage() {
    const [start, setStart] = useState(false);
    const [avatarReady, setAvatarReady] = useState(false);
    const [loading, setLoading] = useState(false);
    const [currentEmotion, setCurrentEmotion] = useState('neutral');
    const [selectedPersona, setSelectedPersona] = useState(null);
    const [hoveredPersona, setHoveredPersona] = useState(null); // Initial null to avoid premature access
    const avatarRef = useRef(null);
    const [chatMessages, setChatMessages] = useState([]);

    // Connection guard
    const isConnecting = useRef(false);

    const PERSONAS = React.useMemo(() => [
        {
            id: 'sakhi',
            name: 'Sakhi',
            hindiName: 'सखी',
            tagline: 'The Listener',
            description: 'A warm, compassionate companion who truly understands',
            agentId: import.meta.env.VITE_ELEVENLABS_LUNA_AGENT_ID || '',
            avatar: '/avatars/luna.glb',
            image: '/avatars/sakhi.png',
            color: '#8B5CF6', // Purple
            glowColor: 'rgba(139, 92, 246, 0.4)',
        },
        {
            id: 'sutradhar',
            name: 'Sutradhar',
            hindiName: 'सूत्रधार',
            tagline: 'The Memory Keeper',
            description: 'Helps you cherish and organize your precious memories',
            agentId: import.meta.env.VITE_ELEVENLABS_GEORGE_AGENT_ID || '',
            avatar: '/avatars/george.glb',
            image: '/avatars/sutradhar.png',
            color: '#0EA5E9', // Blue
            glowColor: 'rgba(14, 165, 233, 0.4)',
        },
        {
            id: 'uday',
            name: 'Uday',
            hindiName: 'उदय',
            tagline: 'The Day Brightener',
            description: 'Brings joy and positivity to every conversation',
            agentId: import.meta.env.VITE_ELEVENLABS_SUNNY_AGENT_ID || '',
            avatar: '/avatars/sunny.glb',
            image: '/avatars/uday.png',
            color: '#f9c74f', // Yellow
            glowColor: 'rgba(249, 199, 79, 0.4)',
        }
    ], []);

    useEffect(() => {
        // Log environment variable status on mount
        console.log("🔍 ENV CHECK:", {
            SAKHI: import.meta.env.VITE_ELEVENLABS_LUNA_AGENT_ID,
            SUTRADHAR: import.meta.env.VITE_ELEVENLABS_GEORGE_AGENT_ID,
            UDAY: import.meta.env.VITE_ELEVENLABS_SUNNY_AGENT_ID,
            DEFAULT: import.meta.env.VITE_ELEVENLABS_AGENT_ID
        });
    }, []);

    const handleElevenLabsMessage = useCallback((message) => {
        const textContent = message.message || message.text || message.content;
        if (textContent) {
            setChatMessages(prev => [...prev, {
                role: message.source === 'user' ? 'user' : 'agent',
                content: textContent
            }]);
        }

        if (textContent) {
            const text = textContent.toLowerCase();
            let detectedEmotion = 'neutral';

            if (text.includes('happy') || text.includes('great') || text.includes('wonderful') || text.includes('excited')) {
                detectedEmotion = 'happy';
            } else if (text.includes('sorry') || text.includes('sad') || text.includes('unfortunate')) {
                detectedEmotion = 'sad';
            } else if (text.includes('think') || text.includes('consider') || text.includes('hmm')) {
                detectedEmotion = 'thinking';
            } else if (text.includes('angry') || text.includes('frustrated')) {
                detectedEmotion = 'angry';
            }

            setCurrentEmotion(detectedEmotion);
        }
    }, []);

    const conversation = useConversation({
        onConnect: () => {
            console.log("✅ Connected to ElevenLabs");
            isConnecting.current = false;
        },
        onDisconnect: () => {
            console.log("❌ Disconnected");
            isConnecting.current = false;
        },
        onMessage: (message) => {
            console.log("📩 Message:", message);
            handleElevenLabsMessage(message);
        },
        onError: (error) => {
            console.error("⚠️ Error:", error);
            isConnecting.current = false;
        },
    });

    const isConnected = conversation.status === 'connected';
    const isSpeaking = conversation.isSpeaking;

    const toggleConnection = async () => {
        if (isConnecting.current || loading) {
            console.log("⏳ Connection already in progress...");
            return;
        }

        if (isConnected) {
            try {
                await conversation.endSession();
            } catch (error) {
                console.error("Failed to end session:", error);
            }
        } else {
            isConnecting.current = true;
            setLoading(true);
            try {
                await navigator.mediaDevices.getUserMedia({ audio: true });

                const agentId = selectedPersona?.agentId || import.meta.env.VITE_ELEVENLABS_AGENT_ID;
                console.log("🎤 Connecting with Persona:", selectedPersona?.name);
                console.log("🆔 Using Agent ID:", agentId);

                if (!agentId) {
                    throw new Error("No Agent ID configured. Please set VITE_ELEVENLABS_AGENT_ID in your .env file.");
                }

                const sessionConfig = { agentId };

                // Load voice from localStorage (set in /customize page)
                // NOTE: Voice overrides temporarily disabled - may cause WebSocket disconnection
                // See: https://github.com/elevenlabs/elevenlabs-js/issues
                // const savedVoice = localStorage.getItem('selectedVoice');
                // if (savedVoice) {
                //     try {
                //         const voice = JSON.parse(savedVoice);
                //         if (voice?.voice_id) {
                //             sessionConfig.overrides = {
                //                 tts: {
                //                     voiceId: voice.voice_id
                //                 }
                //             };
                //             console.log("🎤 Using voice from customize:", voice.name);
                //         }
                //     } catch (e) {
                //         console.error('Error parsing saved voice:', e);
                //     }
                // }

                console.log("🎯 Starting session with config:", sessionConfig);
                await conversation.startSession(sessionConfig);
            } catch (error) {
                console.error("Failed to connect:", error);
                alert(`Failed to connect: ${error.message}`);
                isConnecting.current = false;
            } finally {
                setLoading(false);
            }
        }
    };

    const handlePersonaClick = (persona) => {
        setSelectedPersona(persona);
        setStart(true);
    };

    return (
        <div style={styles.container}>
            {/* Persona Selection - Immersive 3-Pillar Layout */}
            {!start && (
                <div style={styles.selectionContainer}>
                    {/* Top Section - Prompt (20%) */}
                    <div style={styles.topSection}>
                        <h1 style={styles.mainTitle}>Who do you want to talk to today?</h1>
                        <p style={styles.subText}>Main aapki kya seva kar sakta hoon?</p>
                    </div>

                    {/* Bottom Section - 3 Pillars (80%) */}
                    <div style={styles.pillarsContainer}>
                        {PERSONAS.map((persona) => {
                            const isHovered = hoveredPersona?.id === persona.id;

                            return (
                                <div
                                    key={persona.id}
                                    style={{
                                        ...styles.pillar,
                                        transform: isHovered ? 'scale(1.02)' : 'scale(1)',
                                        zIndex: isHovered ? 10 : 1,
                                        boxShadow: isHovered ? `0 0 40px ${persona.glowColor}` : 'none',
                                    }}
                                    onMouseEnter={() => setHoveredPersona(persona)}
                                    onMouseLeave={() => setHoveredPersona(null)}
                                    onClick={() => handlePersonaClick(persona)}
                                >
                                    {/* Background Image */}
                                    <div
                                        style={{
                                            ...styles.pillarImage,
                                            backgroundImage: `url(${persona.image})`,
                                            filter: isHovered ? 'blur(0px) brightness(1)' : 'blur(3px) brightness(0.85)',
                                        }}
                                    />

                                    {/* Gradient Overlay */}
                                    <div style={styles.pillarGradient} />

                                    {/* Label at Bottom */}
                                    <div style={styles.pillarLabel}>
                                        <span style={styles.labelName}>{persona.name}</span>
                                        <span style={styles.labelDivider}>|</span>
                                        <span style={styles.labelHindi}>{persona.hindiName}</span>
                                    </div>

                                    {/* Tagline (visible on hover) */}
                                    {isHovered && (
                                        <div style={styles.taglineOverlay}>
                                            <span style={styles.taglineText}>{persona.tagline}</span>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Loading overlay */}
            {start && !avatarReady && (
                <div style={styles.loadingOverlay}>
                    <div style={styles.loadingSpinner}></div>
                    <p style={styles.loadingText}>Loading {selectedPersona?.name || 'avatar'}...</p>
                </div>
            )}

            {/* Main Chat Interface - Two Column Layout */}
            {start && (
                <div style={{
                    ...styles.chatInterface,
                    opacity: avatarReady ? 1 : 0,
                    pointerEvents: avatarReady ? 'auto' : 'none'
                }}>
                    {/* Left Section - Avatar Only */}
                    <div style={styles.leftSection}>
                        {/* Avatar Container */}
                        <div style={styles.avatarContainer}>
                            <Avatar3D
                                ref={avatarRef}
                                mood={currentEmotion}
                                isSpeaking={isSpeaking}
                                avatarUrl={selectedPersona?.avatar || '/avatars/david.glb'}
                                onLoad={() => setAvatarReady(true)}
                                onError={(e) => {
                                    console.error("Avatar failed to load:", e);
                                    alert("Failed to load avatar. Please refresh the page.");
                                }}
                            />
                            {/* Debug ID Display (Temporary) */}
                            <div style={{
                                position: 'absolute',
                                bottom: '5px',
                                left: '5px',
                                fontSize: '10px',
                                color: 'rgba(0,0,0,0.5)',
                                pointerEvents: 'none'
                            }}>
                                ID: {selectedPersona?.agentId?.slice(0, 10)}...
                            </div>
                        </div>
                    </div>

                    {/* Right Section - Thought Rectangle + Mic */}
                    <div style={styles.rightSection}>
                        {/* Persona Label */}
                        {selectedPersona && (
                            <div style={{
                                ...styles.personaIndicator,
                                borderColor: selectedPersona.color
                            }}>
                                <span>{selectedPersona.name} | {selectedPersona.hindiName}</span>
                            </div>
                        )}

                        {/* Thought Rectangle */}
                        <div style={styles.thoughtRectangle}>
                            <div style={styles.thoughtContent}>
                                {chatMessages.length === 0 ? (
                                    <p style={styles.thoughtPlaceholder}>
                                        {isConnected
                                            ? "Waiting for response..."
                                            : "Click the mic to start a conversation"}
                                    </p>
                                ) : (
                                    <div style={styles.messagesScroll}>
                                        {chatMessages.map((msg, index) => (
                                            <div
                                                key={index}
                                                style={{
                                                    ...styles.messageItem,
                                                    ...(msg.role === 'user' ? styles.userMessage : styles.agentMessage)
                                                }}
                                            >
                                                <span style={styles.messageRole}>
                                                    {msg.role === 'user' ? 'You' : selectedPersona?.name || 'Agent'}
                                                </span>
                                                <p style={styles.messageText}>{msg.content}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Mic Button Below Chat */}
                        <div style={styles.micContainer}>
                            <div style={styles.statusText}>
                                {loading ? "Connecting..." :
                                    isConnected ? (isSpeaking ? "Speaking..." : "Listening...") :
                                        "Click to Connect"}
                            </div>
                            <button
                                onClick={toggleConnection}
                                disabled={loading}
                                style={{
                                    ...styles.micBtn,
                                    backgroundColor: loading ? '#999' : (isConnected ? '#ef4444' : (selectedPersona?.color || '#6B8E23')),
                                    cursor: loading ? 'not-allowed' : 'pointer'
                                }}
                            >
                                {isConnected ? <Square size={28} color="white" /> : <Mic size={28} color="white" />}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

const styles = {
    container: {
        width: "100%",
        flex: 1,
        backgroundColor: "#FDFCF0",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
    },
    selectionContainer: {
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
    },
    // Top Section (15% to give more room to pillars)
    topSection: {
        height: "15%",
        minHeight: "100px",
        backgroundColor: "#FDFCF0",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "10px 20px",
    },
    mainTitle: {
        fontSize: "36px",
        fontWeight: "700",
        color: "#2D2D2D",
        margin: 0,
        textAlign: "center",
        fontFamily: "Georgia, serif",
    },
    subText: {
        fontSize: "18px",
        color: "#666666",
        margin: "8px 0 0 0",
        textAlign: "center",
        fontStyle: "italic",
        fontFamily: "'Caveat', cursive, Georgia, serif",
    },
    // Bottom Section (85%) - 3 Pillars
    pillarsContainer: {
        height: "85%",
        display: "flex",
        flexDirection: "row",
    },
    pillar: {
        flex: 1,
        position: "relative",
        cursor: "pointer",
        overflow: "hidden",
        transition: "all 0.4s ease",
        borderLeft: "1px solid rgba(255,255,255,0.1)",
        borderRight: "1px solid rgba(255,255,255,0.1)",
    },
    pillarImage: {
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundSize: "cover",
        backgroundPosition: "center top",
        transition: "all 0.4s ease",
    },
    pillarGradient: {
        position: "absolute",
        bottom: 0,
        left: 0,
        width: "100%",
        height: "50%",
        background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%)",
        pointerEvents: "none",
    },
    pillarLabel: {
        position: "absolute",
        bottom: "40px",
        left: 0,
        width: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: "12px",
        zIndex: 5,
    },
    labelName: {
        fontSize: "32px",
        fontWeight: "600",
        color: "white",
        textShadow: "0 2px 10px rgba(0,0,0,0.5)",
    },
    labelDivider: {
        fontSize: "28px",
        color: "rgba(255,255,255,0.6)",
    },
    labelHindi: {
        fontSize: "28px",
        color: "white",
        textShadow: "0 2px 10px rgba(0,0,0,0.5)",
    },
    taglineOverlay: {
        position: "absolute",
        bottom: "100px",
        left: 0,
        width: "100%",
        display: "flex",
        justifyContent: "center",
        zIndex: 5,
    },
    taglineText: {
        fontSize: "18px",
        color: "rgba(255,255,255,0.9)",
        textTransform: "uppercase",
        letterSpacing: "3px",
        textShadow: "0 2px 8px rgba(0,0,0,0.5)",
    },
    // Loading & Chat UI
    loadingOverlay: {
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        background: "rgba(0,0,0,0.8)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 999
    },
    loadingSpinner: {
        width: "50px",
        height: "50px",
        border: "4px solid #333",
        borderTop: "4px solid #6B8E23",
        borderRadius: "50%",
        animation: "spin 1s linear infinite"
    },
    loadingText: {
        color: "white",
        marginTop: "20px",
        fontSize: "16px"
    },
    uiContainer: {
        position: "absolute",
        bottom: "40px",
        left: "50%",
        transform: "translateX(-50%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "16px",
        zIndex: 100
    },
    personaIndicator: {
        padding: '10px 20px',
        backgroundColor: '#FFFFFF',
        borderRadius: '24px',
        fontSize: '16px',
        fontWeight: '500',
        color: '#2D2926',
        border: '2px solid',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        position: 'absolute',
        top: '20px',
        right: '20px',
        zIndex: 10
    },
    statusText: {
        color: "#666",
        fontWeight: "500",
        fontSize: "14px",
        marginBottom: "8px"
    },
    micBtn: {
        width: "70px",
        height: "70px",
        borderRadius: "50%",
        border: "none",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
        transition: "all 0.2s ease"
    },
    // New Two-Column Chat Interface Styles
    chatInterface: {
        display: "flex",
        flexDirection: "row",
        width: "100%",
        height: "100%",
        flex: 1,
        backgroundImage: 'url(/bg.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
    },
    leftSection: {
        width: "45%",
        minWidth: "450px",
        maxWidth: "600px",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-end",
        backgroundColor: "transparent",
        padding: "20px",
        paddingLeft: "80px",
        paddingBottom: "0px",
        boxSizing: "border-box"
    },
    avatarContainer: {
        width: "100%",
        height: "100%",
        position: "relative",
        overflow: "visible",
        backgroundColor: "transparent"
    },
    micContainer: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        marginTop: "30px",
        gap: "8px"
    },
    rightSection: {
        flex: 1,
        height: "100%",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "30px"
    },
    bgScenery: {
        width: "100%",
        height: "100%",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        boxSizing: "border-box",
        backgroundColor: "#d0d0d0"
    },
    thoughtRectangle: {
        width: "85%",
        maxWidth: "800px",
        height: "50%",
        backgroundColor: "transparent",
        padding: "24px",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        marginBottom: "20px"
    },
    thoughtContent: {
        flex: 1,
        overflowY: "auto",
        display: "flex",
        flexDirection: "column"
    },
    thoughtPlaceholder: {
        color: "rgba(0,0,0,0.5)",
        fontSize: "18px",
        textAlign: "center",
        margin: "auto",
        fontStyle: "italic"
    },
    messagesScroll: {
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        padding: "4px"
    },
    messageItem: {
        padding: "12px 16px",
        borderRadius: "12px",
        maxWidth: "90%",
        backgroundColor: "#FFFFFF",
        border: "1px solid #d1d5db", // Gray-300
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)"
    },
    userMessage: {
        alignSelf: "flex-end",
        backgroundColor: "transparent",
        color: "#2D2926"
    },
    agentMessage: {
        alignSelf: "flex-start",
        backgroundColor: "transparent",
        color: "#2D2926"
    },
    messageRole: {
        fontSize: "11px",
        fontWeight: "600",
        textTransform: "uppercase",
        opacity: 0.7,
        display: "block",
        marginBottom: "4px"
    },
    messageText: {
        fontSize: "15px",
        lineHeight: "1.5",
        margin: 0
    }
};
