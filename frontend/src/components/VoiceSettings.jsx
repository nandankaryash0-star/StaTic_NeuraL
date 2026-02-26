import React, { useState, useEffect, useRef } from 'react';
import { Settings, Volume2, Play, ChevronDown } from 'lucide-react';

export default function VoiceSettings({ onVoiceSelect }) {
    const [voices, setVoices] = useState([]);
    const [selectedVoice, setSelectedVoice] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isExpanded, setIsExpanded] = useState(false);
    const [playingPreview, setPlayingPreview] = useState(null);
    const audioRef = useRef(null);

    // Fetch voices from backend
    useEffect(() => {
        const fetchVoices = async () => {
            try {
                setLoading(true);
                const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/voices`);
                if (!response.ok) throw new Error('Failed to fetch voices');
                const data = await response.json();
                setVoices(data.voices || []);

                // Auto-select first voice
                if (data.voices?.length > 0) {
                    setSelectedVoice(data.voices[0]);
                    onVoiceSelect?.(data.voices[0]);
                }
            } catch (err) {
                console.error('Error fetching voices:', err);
                setError('Failed to load voices');
            } finally {
                setLoading(false);
            }
        };

        fetchVoices();
    }, []);

    const handleVoiceChange = (voice) => {
        setSelectedVoice(voice);
        onVoiceSelect?.(voice);
    };

    const playPreview = (previewUrl, voiceId) => {
        if (playingPreview === voiceId) {
            audioRef.current?.pause();
            setPlayingPreview(null);
            return;
        }

        if (audioRef.current) {
            audioRef.current.src = previewUrl;
            audioRef.current.play();
            setPlayingPreview(voiceId);
            audioRef.current.onended = () => setPlayingPreview(null);
        }
    };

    if (loading) {
        return (
            <div style={styles.container}>
                <div style={styles.loadingText}>Loading voices...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div style={styles.container}>
                <div style={styles.errorText}>{error}</div>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <audio ref={audioRef} style={{ display: 'none' }} />

            {/* Header */}
            <div
                style={styles.header}
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div style={styles.headerLeft}>
                    <Settings size={20} color="#6B8E23" />
                    <span style={styles.headerTitle}>Voice Settings</span>
                </div>
                <ChevronDown
                    size={20}
                    color="#6B8E23"
                    style={{
                        transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.3s ease'
                    }}
                />
            </div>

            {/* Expandable Content */}
            <div style={{
                ...styles.content,
                maxHeight: isExpanded ? '300px' : '0px',
                opacity: isExpanded ? 1 : 0,
                overflow: 'hidden',
                transition: 'all 0.3s ease'
            }}>
                {/* Voice Selection */}
                <div style={styles.section}>
                    <label style={styles.label}>Select Voice</label>
                    <div style={styles.voiceGrid}>
                        {voices.slice(0, 12).map((voice) => (
                            <div
                                key={voice.voice_id}
                                style={{
                                    ...styles.voiceCard,
                                    borderColor: selectedVoice?.voice_id === voice.voice_id ? '#6B8E23' : '#ddd',
                                    backgroundColor: selectedVoice?.voice_id === voice.voice_id ? 'rgba(107, 142, 35, 0.1)' : 'white'
                                }}
                                onClick={() => handleVoiceChange(voice)}
                            >
                                <div style={styles.voiceInfo}>
                                    <span style={styles.voiceName}>{voice.name}</span>
                                    <span style={styles.voiceCategory}>{voice.category}</span>
                                </div>
                                {voice.preview_url && (
                                    <button
                                        style={styles.previewBtn}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            playPreview(voice.preview_url, voice.voice_id);
                                        }}
                                    >
                                        {playingPreview === voice.voice_id ? (
                                            <Volume2 size={14} color="#6B8E23" />
                                        ) : (
                                            <Play size={14} color="#6B8E23" />
                                        )}
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <p style={styles.note}>
                    Speed and other settings are configured in your ElevenLabs Agent dashboard.
                </p>
            </div>

            {/* Selected Voice Info */}
            {selectedVoice && !isExpanded && (
                <div style={styles.selectedInfo}>
                    <Volume2 size={16} color="#6B8E23" />
                    <span>Using: <strong>{selectedVoice.name}</strong></span>
                </div>
            )}
        </div>
    );
}

const styles = {
    container: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '12px',
        padding: '16px',
        width: '100%',
        maxWidth: '400px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
        marginBottom: '20px'
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        cursor: 'pointer',
        userSelect: 'none'
    },
    headerLeft: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
    },
    headerTitle: {
        fontSize: '16px',
        fontWeight: '600',
        color: '#2D2926'
    },
    content: {
        marginTop: '16px'
    },
    section: {
        marginBottom: '16px'
    },
    label: {
        fontSize: '14px',
        fontWeight: '500',
        color: '#2D2926',
        marginBottom: '8px',
        display: 'block'
    },
    voiceGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '8px',
        maxHeight: '180px',
        overflowY: 'auto'
    },
    voiceCard: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '10px 8px',
        borderRadius: '8px',
        border: '2px solid #ddd',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        position: 'relative'
    },
    voiceInfo: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '2px'
    },
    voiceName: {
        fontSize: '12px',
        fontWeight: '600',
        color: '#2D2926',
        textAlign: 'center'
    },
    voiceCategory: {
        fontSize: '10px',
        color: '#888',
        textTransform: 'capitalize'
    },
    previewBtn: {
        position: 'absolute',
        top: '4px',
        right: '4px',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: '4px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },
    note: {
        fontSize: '12px',
        color: '#888',
        fontStyle: 'italic',
        textAlign: 'center',
        margin: 0
    },
    selectedInfo: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginTop: '12px',
        paddingTop: '12px',
        borderTop: '1px solid #eee',
        fontSize: '14px',
        color: '#555'
    },
    loadingText: {
        textAlign: 'center',
        color: '#6B8E23',
        fontSize: '14px',
        padding: '20px'
    },
    errorText: {
        textAlign: 'center',
        color: '#D27D59',
        fontSize: '14px',
        padding: '20px'
    }
};
