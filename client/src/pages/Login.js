import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
            login(res.data.user, res.data.token);
            if (res.data.user.role === 'patient') navigate('/patient-dashboard');
            else if (res.data.user.role === 'doctor') navigate('/doctor-dashboard');
            else if (res.data.user.role === 'admin') navigate('/admin-dashboard');
        } catch (err) {
            setError('Invalid email or password');
        }
    };

    return (
        <div style={styles.page}>
            <nav style={styles.navbar}>
                <span style={styles.navTitle}>Hospital Appointment System</span>
            </nav>
            <div style={styles.container}>
                <div style={styles.card}>
                    <div style={styles.header}>
                        <div style={styles.avatar}>+</div>
                        <h2 style={styles.title}>Welcome back</h2>
                        <p style={styles.subtitle}>Sign in to your account</p>
                    </div>
                    {error && <p style={styles.error}>{error}</p>}
                    <form onSubmit={handleLogin}>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Email address</label>
                            <input
                                style={styles.input}
                                type="email"
                                placeholder="patient@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Password</label>
                            <input
                                style={styles.input}
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <button style={styles.button} type="submit">Login</button>
                    </form>
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
    avatar: { width: '52px', height: '52px', background: '#2C3E50', borderRadius: '50%', margin: '0 auto 14px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '24px' },
    title: { fontSize: '22px', color: '#2C3E50', fontWeight: 'bold', margin: '0 0 4px' },
    subtitle: { fontSize: '14px', color: '#888', margin: 0 },
    error: { color: 'red', fontSize: '13px', marginBottom: '12px', textAlign: 'center' },
    formGroup: { marginBottom: '18px' },
    label: { display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#555', marginBottom: '7px' },
    input: { width: '100%', background: '#ffffff', border: '1px solid #d0d0d0', borderRadius: '8px', padding: '11px 14px', fontSize: '14px', boxSizing: 'border-box' },
    button: { width: '100%', background: '#2C3E50', color: 'white', border: 'none', borderRadius: '8px', padding: '13px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer' },
    footer: { background: '#2C3E50', padding: '10px', textAlign: 'center' },
    footerText: { fontSize: '12px', color: '#a0aec0' }
};

export default Login;