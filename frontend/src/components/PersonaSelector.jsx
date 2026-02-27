import React, { useState, useEffect } from 'react';
import { Check } from 'lucide-react';

/**
 * Persona configuration - maps personas to ElevenLabs agents and avatars
 * Add your ElevenLabs agent IDs in .env file
 */
const PERSONAS = [
    {
        id: 'luna',
        name: 'Luna',
        tagline: 'The Empathetic Listener',
        description: 'A warm, compassionate companion who truly understands',
        agentId: import.meta.env.VITE_ELEVENLABS_LUNA_AGENT_ID || '',
        avatar: '/avatars/luna.glb',
        defaultVoice: null,
        color: '#8B5CF6', // Purple - calming, empathetic
        emoji: '🌙'
    },
    {
        id: 'george',
        name: 'George',
        tagline: 'The Memory Keeper',
        description: 'Helps you cherish and organize your precious memories',
        agentId: import.meta.env.VITE_ELEVENLABS_GEORGE_AGENT_ID || '',
        avatar: '/avatars/george.glb',
        defaultVoice: null,
        color: '#0EA5E9', // Blue - trustworthy, reliable
        emoji: '📚'
    },
    {
        id: 'sunny',
        name: 'Sunny',
        tagline: 'The Day Brightener',
        description: 'Brings joy and positivity to every conversation',
        agentId: import.meta.env.VITE_ELEVENLABS_SUNNY_AGENT_ID || '',
        avatar: '/avatars/sunny.glb',
        defaultVoice: null,
        color: '#f9c74f', // Warm yellow - cheerful, uplifting
        emoji: '☀️'
    }
];

export default function PersonaSelector({ onPersonaSelect, selectedPersona }) {
    const [expandedPersona, setExpandedPersona] = useState(null);

    // Auto-select first persona on mount
    useEffect(() => {
        if (!selectedPersona && PERSONAS.length > 0) {
            handlePersonaSelect(PERSONAS[0]);
        }
    }, []);

    const handlePersonaSelect = (persona) => {
        onPersonaSelect?.(persona);
        setExpandedPersona(expandedPersona === persona.id ? null : persona.id);
    };

    return (
        <div style={styles.container}>
            <h3 style={styles.title}>Choose Your Assistant</h3>

            {/* Persona Cards */}
            <div style={styles.personaGrid}>
                {PERSONAS.map((persona) => (
                    <div
                        key={persona.id}
                        style={{
                            ...styles.personaCard,
                            borderColor: selectedPersona?.id === persona.id ? persona.color : '#e5e5e5',
                            backgroundColor: selectedPersona?.id === persona.id ? `${persona.color}15` : 'white',
                            boxShadow: selectedPersona?.id === persona.id ? `0 4px 12px ${persona.color}30` : 'none'
                        }}
                        onClick={() => handlePersonaSelect(persona)}
                    >
                        <div style={{
                            ...styles.personaIcon,
                            backgroundColor: persona.color
                        }}>
                            <span style={{ fontSize: '24px' }}>{persona.emoji}</span>
                        </div>
                        <div style={styles.personaInfo}>
                            <span style={styles.personaName}>{persona.name}</span>
                            <span style={{
                                ...styles.personaTagline,
                                color: persona.color
                            }}>{persona.tagline}</span>
                            <span style={styles.personaDesc}>{persona.description}</span>
                        </div>
                        {selectedPersona?.id === persona.id && (
                            <div style={{
                                ...styles.checkBadge,
                                backgroundColor: persona.color
                            }}>
                                <Check size={14} color="white" />
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

// Export personas for use in other components
export { PERSONAS };

const styles = {
    container: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '16px',
        padding: '24px',
        width: '100%',
        maxWidth: '500px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)'
    },
    title: {
        fontSize: '20px',
        fontWeight: '600',
        color: '#2D2926',
        marginBottom: '20px',
        textAlign: 'center'
    },
    personaGrid: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
    },
    personaCard: {
        display: 'flex',
        alignItems: 'center',
        padding: '16px',
        borderRadius: '12px',
        border: '2px solid #ddd',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        position: 'relative'
    },
    personaIcon: {
        width: '48px',
        height: '48px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: '16px'
    },
    personaInfo: {
        display: 'flex',
        flexDirection: 'column',
        gap: '4px'
    },
    personaName: {
        fontSize: '16px',
        fontWeight: '600',
        color: '#2D2926'
    },
    personaTagline: {
        fontSize: '12px',
        fontWeight: '500',
        fontStyle: 'italic'
    },
    personaDesc: {
        fontSize: '13px',
        color: '#666'
    },
    checkBadge: {
        position: 'absolute',
        top: '12px',
        right: '12px',
        width: '24px',
        height: '24px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    }
};
