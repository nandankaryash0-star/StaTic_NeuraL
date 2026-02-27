import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, X, ChevronRight, Image, Loader } from 'lucide-react';

export default function ChatPanel({ conversation, messages, isConnected, onImageAnalysis }) {
    const [isOpen, setIsOpen] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);
    const fileInputRef = useRef(null);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    // Focus input when panel opens
    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    const handleSendMessage = async () => {
        if (!inputValue.trim() || !isConnected || isSending) return;

        try {
            setIsSending(true);
            if (conversation.sendUserActivity) {
                conversation.sendUserActivity();
            }
            await conversation.sendUserMessage(inputValue.trim());
            setInputValue('');
        } catch (error) {
            console.error('Failed to send message:', error);
        } finally {
            setIsSending(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const handleInputChange = (e) => {
        setInputValue(e.target.value);
        if (conversation.sendUserActivity) {
            conversation.sendUserActivity();
        }
    };

    const handleImageSelect = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            alert('Please select an image file');
            return;
        }

        // Convert to base64
        const reader = new FileReader();
        reader.onload = async (event) => {
            const base64 = event.target.result.split(',')[1];
            setSelectedImage({
                base64,
                mimeType: file.type,
                preview: event.target.result,
                name: file.name
            });
        };
        reader.readAsDataURL(file);
    };

    const handleAnalyzeImage = async () => {
        if (!selectedImage || isAnalyzing) return;

        console.log('🖼️ Starting image analysis...');
        setIsAnalyzing(true);
        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
            console.log('📤 Sending image to:', `${apiUrl}/api/analyze-image`);

            const response = await fetch(
                `${apiUrl}/api/analyze-image`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        image: selectedImage.base64,
                        mimeType: selectedImage.mimeType,
                        prompt: inputValue.trim() || 'Describe this image in detail. What do you see?'
                    })
                }
            );

            const data = await response.json();
            console.log('📥 Image analysis response:', data);

            if (!response.ok) {
                throw new Error(data.error || 'Failed to analyze image');
            }

            if (data.description) {
                // Frame the message so the agent doesn't think it needs to "see" an image
                // Avoid using words like "image" or "picture" that trigger the default response
                let contextMessage;
                if (inputValue.trim()) {
                    contextMessage = `${inputValue.trim()}\n\nFor context, here's what I'm looking at: ${data.description}`;
                } else {
                    contextMessage = `I want to discuss something with you. Here's what I'm observing: ${data.description}\n\nWhat can you tell me about this?`;
                }

                console.log('💬 Sending to agent:', contextMessage);
                await conversation.sendUserMessage(contextMessage);
                console.log('✅ Message sent to agent');

                // Notify parent if callback provided
                onImageAnalysis?.(data.description, selectedImage.preview);
            } else {
                throw new Error('No description returned from image analysis');
            }

            setSelectedImage(null);
            setInputValue('');
        } catch (error) {
            console.error('❌ Failed to analyze image:', error);
            alert(`Failed to analyze image: ${error.message}`);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const clearSelectedImage = () => {
        setSelectedImage(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <>
            {/* Hidden file input */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                style={{ display: 'none' }}
            />

            {/* Toggle Button */}
            <button
                style={{
                    ...styles.toggleButton,
                    right: isOpen ? '360px' : '20px',
                    backgroundColor: isConnected ? '#6B8E23' : '#999'
                }}
                onClick={() => setIsOpen(!isOpen)}
                disabled={!isConnected}
            >
                {isOpen ? (
                    <ChevronRight size={24} color="white" />
                ) : (
                    <MessageSquare size={24} color="white" />
                )}
            </button>

            {/* Chat Panel */}
            <div style={{
                ...styles.panel,
                transform: isOpen ? 'translateX(0)' : 'translateX(100%)'
            }}>
                {/* Header */}
                <div style={styles.header}>
                    <div style={styles.headerTitle}>
                        <MessageSquare size={18} color="#6B8E23" />
                        <span>Chat with Agent</span>
                    </div>
                    <button style={styles.closeBtn} onClick={() => setIsOpen(false)}>
                        <X size={20} color="#666" />
                    </button>
                </div>

                {/* Messages */}
                <div style={styles.messagesContainer}>
                    {messages.length === 0 ? (
                        <div style={styles.emptyState}>
                            <MessageSquare size={40} color="#ddd" />
                            <p>No messages yet</p>
                            <p style={styles.emptySubtext}>Type a message or share an image</p>
                        </div>
                    ) : (
                        messages.map((msg, index) => (
                            <div
                                key={index}
                                style={{
                                    ...styles.message,
                                    ...(msg.role === 'user' ? styles.userMessage : styles.agentMessage)
                                }}
                            >
                                <div style={styles.messageRole}>
                                    {msg.role === 'user' ? 'You' : 'Agent'}
                                </div>
                                {msg.image && (
                                    <img src={msg.image} alt="Shared" style={styles.messageImage} />
                                )}
                                <div style={styles.messageContent}>{msg.content}</div>
                            </div>
                        ))
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Selected Image Preview */}
                {selectedImage && (
                    <div style={styles.imagePreviewContainer}>
                        <img src={selectedImage.preview} alt="Selected" style={styles.imagePreview} />
                        <button style={styles.removeImageBtn} onClick={clearSelectedImage}>
                            <X size={16} color="white" />
                        </button>
                        <p style={styles.imageHint}>Add a message or click send to analyze</p>
                    </div>
                )}

                {/* Input Area */}
                <div style={styles.inputContainer}>
                    <button
                        style={styles.imageButton}
                        onClick={() => fileInputRef.current?.click()}
                        disabled={!isConnected || isAnalyzing}
                    >
                        <Image size={20} color={isConnected ? '#6B8E23' : '#999'} />
                    </button>
                    <input
                        ref={inputRef}
                        type="text"
                        value={inputValue}
                        onChange={handleInputChange}
                        onKeyPress={handleKeyPress}
                        placeholder={selectedImage ? "Ask about this image..." : "Type a message..."}
                        disabled={!isConnected || isSending || isAnalyzing}
                        style={{
                            ...styles.input,
                            opacity: isConnected ? 1 : 0.5
                        }}
                    />
                    <button
                        onClick={selectedImage ? handleAnalyzeImage : handleSendMessage}
                        disabled={(!inputValue.trim() && !selectedImage) || !isConnected || isSending || isAnalyzing}
                        style={{
                            ...styles.sendButton,
                            opacity: ((!inputValue.trim() && !selectedImage) || !isConnected || isSending || isAnalyzing) ? 0.5 : 1
                        }}
                    >
                        {isAnalyzing ? (
                            <Loader size={20} color="white" style={{ animation: 'spin 1s linear infinite' }} />
                        ) : (
                            <Send size={20} color="white" />
                        )}
                    </button>
                </div>
            </div>

            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </>
    );
}

const styles = {
    toggleButton: {
        position: 'fixed',
        top: '50%',
        transform: 'translateY(-50%)',
        width: '50px',
        height: '50px',
        borderRadius: '50%',
        border: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
        zIndex: 200,
        transition: 'all 0.3s ease'
    },
    panel: {
        position: 'fixed',
        top: 0,
        right: 0,
        width: '350px',
        height: '100vh',
        backgroundColor: '#FDFBF7',
        boxShadow: '-4px 0 20px rgba(0,0,0,0.1)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 150,
        transition: 'transform 0.3s ease'
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 20px',
        borderBottom: '1px solid #eee',
        backgroundColor: 'white'
    },
    headerTitle: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        fontSize: '16px',
        fontWeight: '600',
        color: '#2D2926'
    },
    closeBtn: {
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: '4px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '4px'
    },
    messagesContainer: {
        flex: 1,
        overflowY: 'auto',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
    },
    emptyState: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        color: '#999',
        textAlign: 'center'
    },
    emptySubtext: {
        fontSize: '12px',
        marginTop: '4px'
    },
    message: {
        padding: '12px 16px',
        borderRadius: '12px',
        maxWidth: '85%'
    },
    userMessage: {
        alignSelf: 'flex-end',
        backgroundColor: '#6B8E23',
        color: 'white'
    },
    agentMessage: {
        alignSelf: 'flex-start',
        backgroundColor: 'white',
        border: '1px solid #eee',
        color: '#2D2926'
    },
    messageRole: {
        fontSize: '10px',
        fontWeight: '600',
        marginBottom: '4px',
        opacity: 0.7,
        textTransform: 'uppercase'
    },
    messageContent: {
        fontSize: '14px',
        lineHeight: '1.4'
    },
    messageImage: {
        maxWidth: '100%',
        borderRadius: '8px',
        marginBottom: '8px'
    },
    imagePreviewContainer: {
        position: 'relative',
        padding: '12px 16px',
        backgroundColor: 'rgba(107, 142, 35, 0.1)',
        borderTop: '1px solid #eee'
    },
    imagePreview: {
        width: '100%',
        maxHeight: '150px',
        objectFit: 'cover',
        borderRadius: '8px'
    },
    removeImageBtn: {
        position: 'absolute',
        top: '8px',
        right: '12px',
        width: '24px',
        height: '24px',
        borderRadius: '50%',
        backgroundColor: 'rgba(0,0,0,0.6)',
        border: 'none',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },
    imageHint: {
        fontSize: '11px',
        color: '#6B8E23',
        marginTop: '8px',
        textAlign: 'center'
    },
    inputContainer: {
        display: 'flex',
        padding: '16px',
        gap: '8px',
        borderTop: '1px solid #eee',
        backgroundColor: 'white'
    },
    imageButton: {
        width: '44px',
        height: '44px',
        borderRadius: '50%',
        backgroundColor: 'rgba(107, 142, 35, 0.1)',
        border: 'none',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },
    input: {
        flex: 1,
        padding: '12px 16px',
        borderRadius: '24px',
        border: '1px solid #ddd',
        fontSize: '14px',
        outline: 'none',
        transition: 'border-color 0.2s ease'
    },
    sendButton: {
        width: '44px',
        height: '44px',
        borderRadius: '50%',
        backgroundColor: '#6B8E23',
        border: 'none',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'opacity 0.2s ease'
    }
};
