import React from 'react';
import { Link } from 'react-router-dom';
import { TypeAnimation } from 'react-type-animation';

export default function LandingPage() {
    const isLoggedIn = !!localStorage.getItem('sarthi_phone');

    return (
        <div style={styles.container}>
            {/* Hero Section - 50/50 Split */}
            <main style={styles.heroSection}>
                {/* Left Side - Text Content */}
                <div style={styles.leftSide}>
                    <div style={styles.textContent}>
                        {/* Animated Title using react-type-animation */}
                        <h1 style={styles.title}>
                            <TypeAnimation
                                sequence={[
                                    'Sarthi',
                                    3000,
                                    'सारथी',
                                    3000,
                                ]}
                                wrapper="span"
                                speed={50}
                                repeat={Infinity}
                                style={styles.titleText}
                            />
                        </h1>

                        {/* Static Tagline */}
                        <h2 style={styles.tagline}>
                            Ek dost jo hamesha sath de
                        </h2>

                        {/* Primary CTA */}
                        {isLoggedIn ? (
                            <Link to="/chat" style={styles.ctaButton}>
                                Start Talking
                            </Link>
                        ) : (
                            <Link to="/signup" style={styles.ctaButton}>
                                Start Talking
                            </Link>
                        )}
                    </div>
                </div>

                {/* Right Side - Hero Image */}
                <div style={styles.rightSide}>
                    <img
                        src="/heroheader.png"
                        alt="Sarthi AI Companion"
                        style={styles.heroImage}
                    />
                </div>
            </main>

            {/* Footer */}
            <footer style={styles.footer}>
                © {new Date().getFullYear()} Sarthi. All rights reserved.
            </footer>
        </div>
    );
}

const styles = {
    container: {
        minHeight: 'calc(100vh - 90px)',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#FDFCF0',
    },
    heroSection: {
        flex: 1,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        padding: '40px 60px',
        maxWidth: '1400px',
        margin: '0 auto',
        width: '100%',
        gap: '60px',
    },
    leftSide: {
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    textContent: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: '24px',
        maxWidth: '500px',
    },
    title: {
        margin: 0,
        minHeight: '100px',
        display: 'flex',
        alignItems: 'center',
    },
    titleText: {
        fontSize: '80px',
        fontWeight: '700',
        color: '#2D2D2D',
        letterSpacing: '-2px',
        display: 'inline-block',
    },
    tagline: {
        fontSize: '24px',
        fontWeight: '400',
        color: 'rgba(45, 45, 45, 0.7)',
        margin: 0,
        marginTop: '8px',
        lineHeight: '1.5',
    },
    ctaButton: {
        marginTop: '40px',
        padding: '20px 48px',
        fontSize: '20px',
        fontWeight: '600',
        color: '#FFFFFF',
        backgroundColor: '#E07A5F',
        border: 'none',
        borderRadius: '50px',
        textDecoration: 'none',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        boxShadow: '0 8px 30px rgba(224, 122, 95, 0.3)',
    },
    rightSide: {
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
    },
    heroImage: {
        maxWidth: '100%',
        maxHeight: '500px',
        objectFit: 'contain',
        borderRadius: '20px',
    },
    footer: {
        padding: '24px',
        textAlign: 'center',
        color: 'rgba(45, 45, 45, 0.4)',
        fontSize: '14px',
    },
};
