import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Register = () => {
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        date_of_birth: '',
        role: 'patient'
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        setLoading(true);
        try {
            await axios.post('http://localhost:5000/api/auth/register', {
                first_name: formData.first_name,
                last_name: formData.last_name,
                email: formData.email,
                password: formData.password,
                role: formData.role,
                phone: formData.phone,
                date_of_birth: formData.date_of_birth
            });
            setSuccess('Account created successfully! Redirecting to login...');
            setError('');
            setTimeout(() => navigate('/'), 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong');
            setSuccess('');
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
                        <div style={styles.avatar}>+</div>
                        <h2 style={styles.title}>Create Account</h2>
                        <p style={styles.subtitle}>Register for a new account</p>
                    </div>
                    {error && <p style={styles.error}>{error}</p>}
                    {success && <p style={styles.success}>{success}</p>}
                    <form onSubmit={handleRegister}>
                        <div style={styles.row}>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>First Name</label>
                                <input style={styles.input} type="text" name="first_name" placeholder="John" value={formData.first_name} onChange={handleChange} required />
                            </div>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Last Name</label>
                                <input style={styles.input} type="text" name="last_name" placeholder="Smith" value={formData.last_name} onChange={handleChange} required />
                            </div>
                        </div>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Email address</label>
                            <input style={styles.input} type="email" name="email" placeholder="john@example.com" value={formData.email} onChange={handleChange} required />
                        </div>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Phone number</label>
                            <input style={styles.input} type="text" name="phone" placeholder="07123456789" value={formData.phone} onChange={handleChange} />
                        </div>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Date of Birth</label>
                            <input style={styles.input} type="date" name="date_of_birth" value={formData.date_of_birth} onChange={handleChange} />
                        </div>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Password</label>
                            <input style={styles.input} type="password" name="password" placeholder="••••••••" value={formData.password} onChange={handleChange} required />
                        </div>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Confirm Password</label>
                            <input style={styles.input} type="password" name="confirmPassword" placeholder="••••••••" value={formData.confirmPassword} onChange={handleChange} required />
                        </div>
                        <button style={styles.button} type="submit" disabled={loading}>
                            {loading ? 'Creating account...' : 'Create Account'}
                        </button>
                    </form>
                    <div style={styles.loginLink}>
                        <span style={styles.loginText}>Already have an account? </span>
                        <span style={styles.loginBtn} onClick={() => navigate('/')}>Sign in here</span>
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
    card: { background: '#F5F5F5', border: '1px solid #d0d0d0', borderRadius: '12px', padding: '40px 44px', width: '100%', maxWidth: '480px' },
    header: { textAlign: 'center', marginBottom: '28px' },
    avatar: { width: '52px', height: '52px', background: '#2C3E50', borderRadius: '50%', margin: '0 auto 14px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '24px' },
    title: { fontSize: '22px', color: '#2C3E50', fontWeight: 'bold', margin: '0 0 4px' },
    subtitle: { fontSize: '14px', color: '#888', margin: 0 },
    error: { color: 'red', fontSize: '13px', marginBottom: '12px', textAlign: 'center' },
    success: { color: '#2e7d32', fontSize: '13px', marginBottom: '12px', textAlign: 'center', background: '#eaf6ee', padding: '10px', borderRadius: '8px' },
    row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' },
    formGroup: { marginBottom: '16px' },
    label: { display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#555', marginBottom: '7px' },
    input: { width: '100%', background: '#ffffff', border: '1px solid #d0d0d0', borderRadius: '8px', padding: '11px 14px', fontSize: '14px', boxSizing: 'border-box' },
    button: { width: '100%', background: '#2C3E50', color: 'white', border: 'none', borderRadius: '8px', padding: '13px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer', marginBottom: '16px' },
    loginLink: { textAlign: 'center' },
    loginText: { fontSize: '13px', color: '#888' },
    loginBtn: { fontSize: '13px', color: '#2C3E50', fontWeight: 'bold', cursor: 'pointer' },
    footer: { background: '#2C3E50', padding: '10px', textAlign: 'center' },
    footerText: { fontSize: '12px', color: '#a0aec0' }
};

export default Register;