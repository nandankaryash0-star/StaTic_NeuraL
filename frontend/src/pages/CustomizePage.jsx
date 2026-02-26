import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Pause } from 'lucide-react';

// Voice options with titles and descriptions
const voiceOptions = [
    { id: 1, title: 'Calm & Deep', description: 'Soothing and slow' },
    { id: 2, title: 'Warm & Gentle', description: 'Soft and caring' },
    { id: 3, title: 'Clear & Crisp', description: 'Easy to follow' },
    { id: 4, title: 'Cheerful', description: 'Bright and happy' },
    { id: 5, title: 'Patient', description: 'Slow and steady' },
    { id: 6, title: 'Friendly', description: 'Like an old friend' },
    { id: 7, title: 'Reassuring', description: 'Calm and confident' },
    { id: 8, title: 'Expressive', description: 'Full of emotion' },
];

export default function CustomizePage() {
    const [voices, setVoices] = useState([]);
    const [selectedVoice, setSelectedVoice] = useState(null);
    const [loadingVoices, setLoadingVoices] = useState(false);
    const [playingPreview, setPlayingPreview] = useState(null);
    const [hoveredCard, setHoveredCard] = useState(null);
    const audioRef = useRef(null);
    const navigate = useNavigate();

    // Fetch voices from backend API
    useEffect(() => {
        const fetchVoices = async () => {
            try {
                setLoadingVoices(true);
                const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/voices`);
                if (!response.ok) throw new Error('Failed to fetch voices');
                const data = await response.json();
                setVoices(data.voices || []);
            } catch (err) {
                console.error('Error fetching voices:', err);
            } finally {
                setLoadingVoices(false);
            }
        };
        fetchVoices();
    }, []);

    // Load saved voice from localStorage on mount
    useEffect(() => {
        const savedVoice = localStorage.getItem('selectedVoice');
        if (savedVoice) {
            try {
                setSelectedVoice(JSON.parse(savedVoice));
            } catch (e) {
                console.error('Error parsing saved voice:', e);
            }
        }
    }, []);

    // Save selected voice to localStorage
    const handleVoiceSelect = (voice, voiceOption) => {
        const voiceData = { ...voice, displayTitle: voiceOption.title, displayDesc: voiceOption.description };
        setSelectedVoice(voiceData);
        localStorage.setItem('selectedVoice', JSON.stringify(voiceData));
    };

    // Play voice preview
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

    const handleContinue = () => {
        navigate('/chat');
    };

    // Merge API voices with display options
    const displayVoices = voiceOptions.map((option, index) => ({
        ...option,
        apiVoice: voices[index] || null
    }));

    return (
        <div style={styles.container}>
            <audio ref={audioRef} style={{ display: 'none' }} />

            {/* Page Title */}
            <h1 style={styles.pageTitle}>
                Choose a voice for your companion
            </h1>

            {/* Voice Grid */}
            <div style={styles.gridContainer}>
                {loadingVoices ? (
                    <div style={styles.loadingText}>Loading voices...</div>
                ) : (
                    <div style={styles.grid}>
                        {displayVoices.map((voiceOption) => {
                            const isSelected = selectedVoice?.displayTitle === voiceOption.title;
                            const isHovered = hoveredCard === voiceOption.id;
                            const isPlaying = playingPreview === voiceOption.apiVoice?.voice_id;

                            return (
                                <div
                                    key={voiceOption.id}
                                    style={{
                                        ...styles.card,
                                        ...(isSelected || isHovered ? styles.cardActive : {}),
                                        transform: isHovered ? 'scale(1.05)' : 'scale(1)',
                                    }}
                                    onClick={() => voiceOption.apiVoice && handleVoiceSelect(voiceOption.apiVoice, voiceOption)}
                                    onMouseEnter={() => setHoveredCard(voiceOption.id)}
                                    onMouseLeave={() => setHoveredCard(null)}
                                >
                                    {/* Play Button */}
                                    <button
                                        style={{
                                            ...styles.playButton,
                                            ...(isSelected || isHovered ? styles.playButtonActive : {}),
                                        }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (voiceOption.apiVoice?.preview_url) {
                                                playPreview(voiceOption.apiVoice.preview_url, voiceOption.apiVoice.voice_id);
                                            }
                                        }}
                                    >
                                        {isPlaying ? (
                                            <Pause size={24} color="white" />
                                        ) : (
                                            <Play size={24} color="white" style={{ marginLeft: '3px' }} />
                                        )}
                                    </button>

                                    {/* Title */}
                                    <h3 style={styles.cardTitle}>{voiceOption.title}</h3>

                                    {/* Description */}
                                    <p style={styles.cardDescription}>{voiceOption.description}</p>

                                    {/* Selected indicator */}
                                    {isSelected && (
                                        <div style={styles.selectedBadge}>✓</div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Save & Continue Button */}
            <button
                onClick={handleContinue}
                disabled={!selectedVoice}
                style={{
                    ...styles.continueButton,
                    ...(selectedVoice ? {} : styles.continueButtonDisabled),
                }}
            >
                Save & Continue
            </button>
        </div>
    );
}

const styles = {
    container: {
        flex: 1,
        backgroundColor: '#FDFCF0',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '32px 24px 32px',
        overflow: 'hidden',
    },
    pageTitle: {
        fontSize: '42px',
        fontWeight: '600',
        color: '#2D2926',
        textAlign: 'center',
        marginBottom: '48px',
        fontFamily: 'Georgia, serif',
        lineHeight: '1.3',
    },
    gridContainer: {
        width: '100%',
        maxWidth: '900px',
        marginBottom: '48px',
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '20px',
    },
    loadingText: {
        textAlign: 'center',
        color: '#666',
        fontSize: '18px',
        padding: '48px',
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: '16px',
        padding: '24px 16px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '12px',
        cursor: 'pointer',
        transition: 'all 0.25s ease',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
        border: '2px solid transparent',
        position: 'relative',
    },
    cardActive: {
        borderColor: '#E07A5F',
        boxShadow: '0 8px 24px rgba(224, 122, 95, 0.15)',
    },
    playButton: {
        width: '56px',
        height: '56px',
        borderRadius: '50%',
        backgroundColor: '#E07A5F',
        border: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        opacity: 0.85,
    },
    playButtonActive: {
        opacity: 1,
        transform: 'scale(1.05)',
        boxShadow: '0 4px 12px rgba(224, 122, 95, 0.4)',
    },
    cardTitle: {
        fontSize: '18px',
        fontWeight: '700',
        color: '#2D2926',
        margin: 0,
        textAlign: 'center',
    },
    cardDescription: {
        fontSize: '14px',
        color: '#888888',
        margin: 0,
        textAlign: 'center',
    },
    selectedBadge: {
        position: 'absolute',
        top: '8px',
        right: '8px',
        width: '24px',
        height: '24px',
        borderRadius: '50%',
        backgroundColor: '#E07A5F',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '14px',
        fontWeight: 'bold',
    },
    continueButton: {
        backgroundColor: '#2D2D2D',
        color: 'white',
        border: 'none',
        borderRadius: '12px',
        padding: '18px 64px',
        fontSize: '18px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        marginTop: 'auto',
    },
    continueButtonDisabled: {
        backgroundColor: '#CCCCCC',
        cursor: 'not-allowed',
    },
};

// Add responsive styles via media query
const styleSheet = document.createElement('style');
styleSheet.textContent = `
    @media (max-width: 768px) {
        .voice-grid {
            grid-template-columns: repeat(2, 1fr) !important;
        }
    }
`;
if (!document.querySelector('#customize-page-styles')) {
    styleSheet.id = 'customize-page-styles';
    document.head.appendChild(styleSheet);
}
