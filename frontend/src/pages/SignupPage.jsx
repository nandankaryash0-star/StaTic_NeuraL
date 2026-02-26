import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

// Questions flow - one by one (Name then Phone)
const questions = [
    { id: 'name', label: "What should I call you?", placeholder: "Your Name", type: "text" },
    { id: 'phone', label: "What is your phone number?", placeholder: "+91 9876543210", type: "tel" }
];

export default function SignupPage() {
    const [currentQ, setCurrentQ] = useState(0);
    const [answers, setAnswers] = useState({});
    const [inputVal, setInputVal] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const navigate = useNavigate();
    const question = questions[currentQ];

    const handleNext = async () => {
        if (!inputVal.trim()) {
            setError('Please enter a value to continue');
            return;
        }

        setError(null);
        const newAnswers = { ...answers, [question.id]: inputVal.trim() };
        setAnswers(newAnswers);
        setInputVal('');

        if (currentQ < questions.length - 1) {
            setCurrentQ(currentQ + 1);
        } else {
            // Complete - Save Profile
            await saveProfile(newAnswers);
        }
    };

    const handleBack = () => {
        if (currentQ > 0) {
            setCurrentQ(currentQ - 1);
            setInputVal(answers[questions[currentQ - 1].id] || '');
            setError(null);
        }
    };

    const saveProfile = async (finalAnswers) => {
        setLoading(true);
        setError(null);

        let phone = finalAnswers.phone;
        if (!phone) {
            setError("Phone number is required.");
            setLoading(false);
            return;
        }

        // Format phone number to E.164
        phone = phone.trim();
        phone = phone.replace(/[^\d+]/g, '');
        if (phone.length === 10 && !phone.startsWith('+')) {
            phone = '+91' + phone;
        }
        if (!phone.startsWith('+')) {
            phone = '+' + phone;
        }

        const payload = {
            ...finalAnswers,
            phone
        };

        try {
            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/profile`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to save profile');

            // Save phone for login convenience
            localStorage.setItem('sarthi_phone', phone);
            navigate('/login');
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                {/* Brand */}
                <Link to="/" style={styles.brand}>
                    Sarthi
                </Link>

                {/* Progress */}
                <div style={styles.progress}>
                    <span style={styles.step}>Step {currentQ + 1} of {questions.length}</span>
                    <div style={styles.progressBar}>
                        <div
                            style={{
                                ...styles.progressFill,
                                width: `${((currentQ + 1) / questions.length) * 100}%`
                            }}
                        />
                    </div>
                </div>

                {/* Question */}
                <h1 style={styles.question}>{question.label}</h1>

                {/* Error */}
                {error && (
                    <div style={styles.error}>
                        {error}
                    </div>
                )}

                {/* Input */}
                <div style={styles.inputWrapper}>
                    <input
                        type={question.type}
                        placeholder={question.placeholder}
                        value={inputVal}
                        onChange={(e) => setInputVal(e.target.value)}
                        style={styles.input}
                        autoFocus
                        onKeyDown={(e) => e.key === 'Enter' && handleNext()}
                        disabled={loading}
                    />
                </div>

                {/* Buttons */}
                <div style={styles.buttons}>
                    {currentQ > 0 && (
                        <button
                            onClick={handleBack}
                            style={styles.backBtn}
                            disabled={loading}
                        >
                            ← Back
                        </button>
                    )}
                    <button
                        onClick={handleNext}
                        disabled={loading}
                        style={{
                            ...styles.continueBtn,
                            opacity: loading ? 0.7 : 1,
                            cursor: loading ? 'not-allowed' : 'pointer',
                            marginLeft: currentQ > 0 ? '16px' : '0',
                            flex: currentQ > 0 ? 1 : 'none',
                            width: currentQ > 0 ? 'auto' : '100%'
                        }}
                    >
                        {loading ? 'Saving...' : (currentQ === questions.length - 1 ? 'Complete' : 'Continue')}
                    </button>
                </div>

                {/* Footer */}
                <p style={styles.footer}>
                    Already have an account?{' '}
                    <Link to="/login" style={styles.link}>
                        Login
                    </Link>
                </p>
            </div>
        </div>
    );
}

const styles = {
    container: {
        minHeight: 'calc(100vh - 90px)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FDFCF0',
        padding: '40px 20px',
    },
    card: {
        width: '100%',
        maxWidth: '500px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '28px',
    },
    brand: {
        fontSize: '28px',
        fontWeight: '700',
        color: '#2D2D2D',
        textDecoration: 'none',
        marginBottom: '8px',
    },
    progress: {
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
    },
    step: {
        fontSize: '14px',
        fontWeight: '600',
        color: '#E07A5F',
        textTransform: 'uppercase',
        letterSpacing: '1px',
    },
    progressBar: {
        width: '100%',
        height: '6px',
        backgroundColor: 'rgba(224, 122, 95, 0.2)',
        borderRadius: '3px',
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#E07A5F',
        borderRadius: '3px',
        transition: 'width 0.3s ease',
    },
    question: {
        fontSize: '32px',
        fontWeight: '700',
        color: '#2D2D2D',
        margin: 0,
        textAlign: 'center',
        lineHeight: '1.3',
    },
    error: {
        width: '100%',
        padding: '14px 20px',
        backgroundColor: '#FEE2E2',
        color: '#DC2626',
        borderRadius: '12px',
        fontSize: '15px',
        textAlign: 'center',
    },
    inputWrapper: {
        width: '100%',
    },
    input: {
        width: '100%',
        padding: '20px 24px',
        fontSize: '24px',
        border: 'none',
        borderBottom: '3px solid rgba(45, 45, 45, 0.2)',
        backgroundColor: 'transparent',
        color: '#2D2D2D',
        outline: 'none',
        textAlign: 'center',
        transition: 'border-color 0.3s ease',
    },
    buttons: {
        width: '100%',
        display: 'flex',
        marginTop: '16px',
    },
    backBtn: {
        padding: '18px 24px',
        fontSize: '18px',
        fontWeight: '500',
        color: '#2D2D2D',
        backgroundColor: 'transparent',
        border: '2px solid rgba(45, 45, 45, 0.2)',
        borderRadius: '14px',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
    },
    continueBtn: {
        padding: '18px 32px',
        fontSize: '18px',
        fontWeight: '600',
        color: '#FFFFFF',
        backgroundColor: '#E07A5F',
        border: 'none',
        borderRadius: '14px',
        transition: 'all 0.3s ease',
        boxShadow: '0 6px 20px rgba(224, 122, 95, 0.3)',
    },
    footer: {
        fontSize: '16px',
        color: 'rgba(45, 45, 45, 0.6)',
        margin: 0,
        marginTop: '16px',
    },
    link: {
        color: '#E07A5F',
        fontWeight: '600',
        textDecoration: 'none',
    },
};
