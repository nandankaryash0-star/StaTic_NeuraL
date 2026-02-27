import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function LoginPage() {
    const [step, setStep] = useState('phone'); // phone | otp
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleSendCode = async () => {
        if (!phone.trim()) {
            setError('Please enter your phone number');
            return;
        }

        setLoading(true);
        setError(null);

        // Format phone number to E.164
        let formattedPhone = phone.trim();
        formattedPhone = formattedPhone.replace(/[^\d+]/g, '');
        if (formattedPhone.length === 10 && !formattedPhone.startsWith('+')) {
            formattedPhone = '+91' + formattedPhone;
        }
        if (!formattedPhone.startsWith('+')) {
            formattedPhone = '+' + formattedPhone;
        }

        try {
            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/send-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone: formattedPhone }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to send OTP');

            setPhone(formattedPhone);
            setStep('otp');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async () => {
        const token = otp.join('');
        if (token.length !== 6) {
            setError('Please enter the complete 6-digit code');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/verify-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone, token }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Invalid OTP');

            localStorage.setItem('sarthi_phone', phone);
            navigate('/');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleOtpChange = (element, index) => {
        if (isNaN(element.value)) return;

        const newOtp = [...otp];
        newOtp[index] = element.value;
        setOtp(newOtp);

        if (element.value && element.nextSibling) {
            element.nextSibling.focus();
        }
    };

    const handleKeyDown = (e, index) => {
        if (e.key === 'Backspace' && !otp[index] && e.target.previousSibling) {
            e.target.previousSibling.focus();
        }
        if (e.key === 'Enter' && index === 5) {
            handleVerify();
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                {/* Brand */}
                <Link to="/" style={styles.brand}>
                    Sarthi
                </Link>

                {/* Error */}
                {error && (
                    <div style={styles.error}>
                        {error}
                    </div>
                )}

                {step === 'phone' && (
                    <>
                        {/* Header */}
                        <div style={styles.header}>
                            <h1 style={styles.title}>Welcome Back</h1>
                            <p style={styles.subtitle}>Enter your phone number to continue</p>
                        </div>

                        {/* Phone Input */}
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Phone Number</label>
                            <input
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                style={styles.input}
                                placeholder="+91 9876543210"
                                autoFocus
                                disabled={loading}
                                onKeyDown={(e) => e.key === 'Enter' && handleSendCode()}
                            />
                        </div>

                        <button
                            onClick={handleSendCode}
                            disabled={loading}
                            style={{
                                ...styles.submitBtn,
                                opacity: loading ? 0.7 : 1,
                                cursor: loading ? 'not-allowed' : 'pointer'
                            }}
                        >
                            {loading ? 'Sending...' : 'Send Code'}
                        </button>
                    </>
                )}

                {step === 'otp' && (
                    <>
                        {/* Header */}
                        <div style={styles.header}>
                            <h1 style={styles.title}>Enter OTP</h1>
                            <p style={styles.subtitle}>We sent a code to {phone}</p>
                            <p style={styles.hint}>Use code: 123456</p>
                        </div>

                        {/* OTP Inputs */}
                        <div style={styles.otpContainer}>
                            {otp.map((digit, index) => (
                                <input
                                    key={index}
                                    type="text"
                                    maxLength={1}
                                    value={digit}
                                    onChange={(e) => handleOtpChange(e.target, index)}
                                    onKeyDown={(e) => handleKeyDown(e, index)}
                                    onFocus={(e) => e.target.select()}
                                    style={styles.otpInput}
                                    autoFocus={index === 0}
                                />
                            ))}
                        </div>

                        <button
                            onClick={handleVerify}
                            disabled={loading}
                            style={{
                                ...styles.submitBtn,
                                opacity: loading ? 0.7 : 1,
                                cursor: loading ? 'not-allowed' : 'pointer'
                            }}
                        >
                            {loading ? 'Verifying...' : 'Verify & Login'}
                        </button>

                        <button
                            onClick={() => setStep('phone')}
                            style={styles.backBtn}
                        >
                            ← Wrong number? Go back
                        </button>
                    </>
                )}

                {/* Footer */}
                <p style={styles.footer}>
                    Don't have an account?{' '}
                    <Link to="/signup" style={styles.link}>
                        Sign Up
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
        maxWidth: '440px',
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
        marginBottom: '16px',
    },
    header: {
        textAlign: 'center',
    },
    title: {
        fontSize: '36px',
        fontWeight: '700',
        color: '#2D2D2D',
        margin: '0 0 12px 0',
    },
    subtitle: {
        fontSize: '18px',
        color: 'rgba(45, 45, 45, 0.6)',
        margin: 0,
    },
    hint: {
        fontSize: '14px',
        color: '#E07A5F',
        marginTop: '8px',
        fontWeight: '500',
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
    inputGroup: {
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
    },
    label: {
        fontSize: '16px',
        fontWeight: '500',
        color: '#2D2D2D',
    },
    input: {
        width: '100%',
        padding: '18px 20px',
        fontSize: '20px',
        border: '2px solid rgba(45, 45, 45, 0.15)',
        borderRadius: '14px',
        backgroundColor: '#FFFFFF',
        color: '#2D2D2D',
        outline: 'none',
        transition: 'border-color 0.3s ease',
    },
    otpContainer: {
        display: 'flex',
        gap: '12px',
        justifyContent: 'center',
    },
    otpInput: {
        width: '52px',
        height: '64px',
        textAlign: 'center',
        fontSize: '24px',
        fontWeight: '600',
        border: '2px solid rgba(45, 45, 45, 0.15)',
        borderRadius: '12px',
        backgroundColor: '#FFFFFF',
        color: '#2D2D2D',
        outline: 'none',
        transition: 'border-color 0.3s ease',
    },
    submitBtn: {
        width: '100%',
        padding: '18px',
        fontSize: '18px',
        fontWeight: '600',
        color: '#FFFFFF',
        backgroundColor: '#E07A5F',
        border: 'none',
        borderRadius: '14px',
        transition: 'all 0.3s ease',
        boxShadow: '0 6px 20px rgba(224, 122, 95, 0.3)',
    },
    backBtn: {
        padding: '12px 20px',
        fontSize: '15px',
        color: '#E07A5F',
        backgroundColor: 'transparent',
        border: 'none',
        cursor: 'pointer',
        fontWeight: '500',
    },
    footer: {
        fontSize: '16px',
        color: 'rgba(45, 45, 45, 0.6)',
        margin: 0,
        marginTop: '8px',
    },
    link: {
        color: '#E07A5F',
        fontWeight: '600',
        textDecoration: 'none',
    },
};
