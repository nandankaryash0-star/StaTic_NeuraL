import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

export default function Navbar() {
    const navigate = useNavigate();
    const location = useLocation();
    const isLoggedIn = !!localStorage.getItem('sarthi_phone');

    const handleLogout = () => {
        localStorage.removeItem('sarthi_phone');
        navigate('/');
    };

    return (
        <nav style={styles.navbar}>
            <div style={styles.container}>
                {/* Brand Name - Far Left */}
                <Link to={isLoggedIn ? "/chat" : "/"} style={styles.brand}>
                    Sarthi
                </Link>

                {/* Action Buttons - Far Right */}
                {isLoggedIn ? (
                    /* Logged In: Chat, Customize, Logout */
                    <div style={styles.authButtons}>
                        <Link
                            to="/chat"
                            style={{
                                ...styles.navBtn,
                                ...(location.pathname === '/chat' ? styles.navBtnActive : {})
                            }}
                        >
                            Chat
                        </Link>
                        <Link
                            to="/customize"
                            style={{
                                ...styles.navBtn,
                                ...(location.pathname === '/customize' ? styles.navBtnActive : {})
                            }}
                        >
                            Customize
                        </Link>
                        <button
                            onClick={handleLogout}
                            style={styles.logoutBtn}
                        >
                            Logout
                        </button>
                    </div>
                ) : (
                    /* Logged Out: Login (ghost), Sign Up (solid) */
                    <div style={styles.authButtons}>
                        <Link to="/login" style={styles.loginBtn}>
                            Login
                        </Link>
                        <Link to="/signup" style={styles.signupBtn}>
                            Sign Up
                        </Link>
                    </div>
                )}
            </div>
        </nav>
    );
}

const styles = {
    navbar: {
        width: '100%',
        padding: '20px 40px',
        backgroundColor: '#FDFCF0',
        borderBottom: 'none',
    },
    container: {
        maxWidth: '1400px',
        margin: '0 auto',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    brand: {
        fontSize: '32px',
        fontWeight: '700',
        color: '#2D2D2D',
        textDecoration: 'none',
        letterSpacing: '-0.5px',
    },
    authButtons: {
        display: 'flex',
        gap: '16px',
        alignItems: 'center',
    },
    /* Ghost button for Login */
    loginBtn: {
        padding: '14px 32px',
        fontSize: '18px',
        fontWeight: '500',
        color: '#2D2D2D',
        backgroundColor: 'transparent',
        border: '2px solid #2D2D2D',
        borderRadius: '12px',
        textDecoration: 'none',
        transition: 'all 0.3s ease',
        cursor: 'pointer',
    },
    /* Solid terracotta button for Sign Up */
    signupBtn: {
        padding: '14px 32px',
        fontSize: '18px',
        fontWeight: '500',
        color: '#FFFFFF',
        backgroundColor: '#E07A5F',
        border: 'none',
        borderRadius: '12px',
        textDecoration: 'none',
        transition: 'all 0.3s ease',
        cursor: 'pointer',
    },
    /* Navigation text buttons when logged in */
    navBtn: {
        padding: '14px 24px',
        fontSize: '18px',
        fontWeight: '500',
        color: '#2D2D2D',
        backgroundColor: 'transparent',
        border: 'none',
        borderRadius: '12px',
        textDecoration: 'none',
        transition: 'all 0.2s ease',
        cursor: 'pointer',
    },
    navBtnActive: {
        color: '#E07A5F',
        backgroundColor: 'rgba(224, 122, 95, 0.1)',
    },
    /* Logout button */
    logoutBtn: {
        padding: '14px 32px',
        fontSize: '18px',
        fontWeight: '500',
        color: '#FFFFFF',
        backgroundColor: '#E07A5F',
        border: 'none',
        borderRadius: '12px',
        textDecoration: 'none',
        transition: 'all 0.3s ease',
        cursor: 'pointer',
    },
};
