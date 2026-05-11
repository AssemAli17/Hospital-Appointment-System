import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await axios.post('http://localhost:5000/api/password/forgot-password', { email });
            setMessage(res.data.message);
            setError('');
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong');
            setMessage('');
        }
        setLoading(false);
    };

    return (
        <div style={styles.page}>
            <nav style={styles.navbar}>
                <span style={styles.navTitle}>Hospital Appointment System</span>
            </nav>
            <div style={styles.container}>
                <div style={styles.card}>
                    <div style={styles.header}>
                        <h2 style={styles.title}>Forgot Password</h2>
                        <p style={styles.subtitle}>Enter your email address and we will send you a reset link</p>
                    </div>
                    {message && <p style={styles.success}>{message}</p>}
                    {error && <p style={styles.error}>{error}</p>}
                    <form onSubmit={handleSubmit}>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Email address</label>
                            <input
                                style={styles.input}
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <button style={styles.button} type="submit" disabled={loading}>
                            {loading ? 'Sending...' : 'Send Reset Link'}
                        </button>
                    </form>
                    <div style={styles.backLink}>
                        <span style={styles.backText} onClick={() => navigate('/')}>Back to Login</span>
                    </div>
                </div>
            </div>
            <footer style={styles.footer}>
                <span style={styles.footerText}>© 2026 Hospital Appointment System</span>
            </footer>
        </div>
    );
};

const styles = {
    page: { display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#eef0f3', fontFamily: 'Arial, sans-serif' },
    navbar: { background: '#2C3E50', padding: '14px 32px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    navTitle: { color: 'white', fontSize: '17px', fontWeight: 'bold' },
    container: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' },
    card: { background: '#F5F5F5', border: '1px solid #d0d0d0', borderRadius: '12px', padding: '40px 44px', width: '100%', maxWidth: '420px' },
    header: { textAlign: 'center', marginBottom: '28px' },
    title: { fontSize: '22px', color: '#2C3E50', fontWeight: 'bold', margin: '0 0 8px' },
    subtitle: { fontSize: '13px', color: '#888', margin: 0 },
    success: { color: '#2e7d32', fontSize: '13px', marginBottom: '12px', textAlign: 'center', background: '#eaf6ee', padding: '10px', borderRadius: '8px' },
    error: { color: 'red', fontSize: '13px', marginBottom: '12px', textAlign: 'center' },
    formGroup: { marginBottom: '18px' },
    label: { display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#555', marginBottom: '7px' },
    input: { width: '100%', background: '#ffffff', border: '1px solid #d0d0d0', borderRadius: '8px', padding: '11px 14px', fontSize: '14px', boxSizing: 'border-box' },
    button: { width: '100%', background: '#2C3E50', color: 'white', border: 'none', borderRadius: '8px', padding: '13px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer' },
    backLink: { textAlign: 'center', marginTop: '16px' },
    backText: { fontSize: '13px', color: '#2C3E50', fontWeight: 'bold', cursor: 'pointer' },
    footer: { background: '#2C3E50', padding: '10px', textAlign: 'center' },
    footerText: { fontSize: '12px', color: '#a0aec0' }
};

export default ForgotPassword;