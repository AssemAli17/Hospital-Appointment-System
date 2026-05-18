import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const ManageDoctors = () => {
    const { user, token, logout } = useAuth();
    const navigate = useNavigate();
    const [doctors, setDoctors] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [message, setMessage] = useState('');
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        phone: '',
        date_of_birth: '',
        specialisation: '',
        department_id: ''
    });

    useEffect(() => {
        fetchDoctors();
        fetchDepartments();
    }, []);

    const fetchDoctors = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/doctors', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setDoctors(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchDepartments = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/departments', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setDepartments(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleAddDoctor = async (e) => {
        e.preventDefault();
        try {
            const userRes = await axios.post('http://localhost:5000/api/auth/register', {
                first_name: formData.first_name,
                last_name: formData.last_name,
                email: formData.email,
                password: formData.password,
                role: 'doctor',
                phone: formData.phone,
                date_of_birth: formData.date_of_birth
            }, { headers: { Authorization: `Bearer ${token}` } });

            await axios.post('http://localhost:5000/api/doctors/add', {
                user_id: userRes.data.user.user_id,
                department_id: formData.department_id,
                specialisation: formData.specialisation
            }, { headers: { Authorization: `Bearer ${token}` } });

            setMessage('Doctor added successfully!');
            setShowForm(false);
            setFormData({ first_name: '', last_name: '', email: '', password: '', phone: '', date_of_birth: '', specialisation: '', department_id: '' });
            fetchDoctors();
        } catch (err) {
            setMessage(err.response?.data?.message || 'Failed to add doctor');
        }
    };

    const handleDelete = async (doctorId) => {
        try {
            await axios.delete(`http://localhost:5000/api/doctors/${doctorId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessage('Doctor removed successfully');
            fetchDoctors();
        } catch (err) {
            setMessage('Failed to remove doctor');
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <div style={styles.page}>
            <nav style={styles.navbar}>
                <span style={styles.navTitle}>Hospital Appointment System</span>
                <div style={styles.navRight}>
                    <span style={styles.welcome}>Admin: {user?.first_name}</span>
                    <button style={styles.logoutBtn} onClick={handleLogout}>Logout</button>
                </div>
            </nav>
            <div style={styles.body}>
                <div style={styles.sidebar}>
                    <div style={styles.sidebarItem} onClick={() => navigate('/admin-dashboard')}>📊 Dashboard</div>
                    <div style={{...styles.sidebarItem, ...styles.activeItem}}>👨‍⚕️ Manage Doctors</div>
                    <div style={styles.sidebarItem} onClick={() => navigate('/admin-dashboard')}>📅 Appointments</div>
                    <div style={styles.sidebarItem} onClick={() => navigate('/admin-dashboard')}>👥 User Accounts</div>
                </div>
                <div style={styles.main}>
                    <div style={styles.topRow}>
                        <h2 style={styles.pageTitle}>Manage Doctors</h2>
                        <button style={styles.addBtn} onClick={() => setShowForm(!showForm)}>
                            {showForm ? 'Cancel' : '+ Add New Doctor'}
                        </button>
                    </div>

                    {message && (
                        <p style={{
                            padding: '10px',
                            borderRadius: '8px',
                            background: message.includes('successfully') ? '#eaf6ee' : '#fce8e8',
                            color: message.includes('successfully') ? '#2e7d32' : '#c62828',
                            fontSize: '13px',
                            fontWeight: 'bold',
                            marginBottom: '16px'
                        }}>{message}</p>
                    )}

                    {showForm && (
                        <div style={styles.formCard}>
                            <h3 style={styles.formTitle}>Add New Doctor</h3>
                            <form onSubmit={handleAddDoctor}>
                                <div style={styles.row}>
                                    <div style={styles.formGroup}>
                                        <label style={styles.label}>First Name</label>
                                        <input style={styles.input} type="text" name="first_name" value={formData.first_name} onChange={handleChange} required />
                                    </div>
                                    <div style={styles.formGroup}>
                                        <label style={styles.label}>Last Name</label>
                                        <input style={styles.input} type="text" name="last_name" value={formData.last_name} onChange={handleChange} required />
                                    </div>
                                </div>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Email</label>
                                    <input style={styles.input} type="email" name="email" value={formData.email} onChange={handleChange} required />
                                </div>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Password</label>
                                    <input style={styles.input} type="password" name="password" value={formData.password} onChange={handleChange} required />
                                </div>
                                <div style={styles.row}>
                                    <div style={styles.formGroup}>
                                        <label style={styles.label}>Phone</label>
                                        <input style={styles.input} type="text" name="phone" value={formData.phone} onChange={handleChange} />
                                    </div>
                                    <div style={styles.formGroup}>
                                        <label style={styles.label}>Date of Birth</label>
                                        <input style={styles.input} type="date" name="date_of_birth" value={formData.date_of_birth} onChange={handleChange} />
                                    </div>
                                </div>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Specialisation</label>
                                    <input style={styles.input} type="text" name="specialisation" value={formData.specialisation} onChange={handleChange} required />
                                </div>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Department</label>
                                    <select style={styles.input} name="department_id" value={formData.department_id} onChange={handleChange} required>
                                        <option value="">Select department</option>
                                        {departments.map(dept => (
                                            <option key={dept.department_id} value={dept.department_id}>{dept.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <button style={styles.submitBtn} type="submit">Add Doctor</button>
                            </form>
                        </div>
                    )}

                    <div style={styles.card}>
                        <h3 style={styles.cardTitle}>All Doctors ({doctors.length})</h3>
                        {doctors.length === 0 ? (
                            <p style={styles.hint}>No doctors registered yet</p>
                        ) : (
                            <table style={styles.table}>
                                <thead>
                                    <tr>
                                        <th style={styles.th}>Name</th>
                                        <th style={styles.th}>Email</th>
                                        <th style={styles.th}>Department</th>
                                        <th style={styles.th}>Specialisation</th>
                                        <th style={styles.th}>Status</th>
                                        <th style={styles.th}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {doctors.map(doc => (
                                        <tr key={doc.doctor_id}>
                                            <td style={styles.td}>Dr. {doc.first_name} {doc.last_name}</td>
                                            <td style={styles.td}>{doc.email}</td>
                                            <td style={styles.td}>{doc.department}</td>
                                            <td style={styles.td}>{doc.specialisation}</td>
                                            <td style={styles.td}>
                                                <span style={{...styles.badge, background: doc.is_available ? '#eaf6ee' : '#fce8e8', color: doc.is_available ? '#2e7d32' : '#c62828'}}>
                                                    {doc.is_available ? 'Available' : 'Unavailable'}
                                                </span>
                                            </td>
                                            <td style={styles.td}>
                                                <button style={styles.deleteBtn} onClick={() => handleDelete(doc.doctor_id)}>Remove</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
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
    navbar: { background: '#2C3E50', padding: '14px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
    navTitle: { color: 'white', fontSize: '16px', fontWeight: 'bold' },
    navRight: { display: 'flex', alignItems: 'center', gap: '16px' },
    welcome: { color: '#a0aec0', fontSize: '13px' },
    logoutBtn: { background: '#3d5166', border: 'none', borderRadius: '20px', padding: '6px 16px', color: 'white', fontSize: '13px', cursor: 'pointer' },
    body: { display: 'flex', flex: 1 },
    sidebar: { background: '#34495E', width: '210px', padding: '24px 0', display: 'flex', flexDirection: 'column' },
    sidebarItem: { padding: '13px 24px', cursor: 'pointer', color: '#a0aec0', fontSize: '14px', borderLeft: '4px solid transparent' },
    activeItem: { background: '#2C3E50', color: 'white', fontWeight: 'bold', borderLeft: '4px solid #3498DB' },
    main: { flex: 1, padding: '28px' },
    topRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
    pageTitle: { fontSize: '22px', fontWeight: 'bold', color: '#2C3E50', margin: 0 },
    addBtn: { background: '#2C3E50', color: 'white', border: 'none', borderRadius: '8px', padding: '10px 20px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer' },
    formCard: { background: 'white', borderRadius: '10px', padding: '24px', border: '1px solid #e0e0e0', marginBottom: '24px' },
    formTitle: { fontSize: '16px', fontWeight: 'bold', color: '#2C3E50', marginBottom: '16px' },
    row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' },
    formGroup: { marginBottom: '14px' },
    label: { display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#555', marginBottom: '5px' },
    input: { width: '100%', background: '#ffffff', border: '1px solid #d0d0d0', borderRadius: '8px', padding: '10px', fontSize: '13px', boxSizing: 'border-box' },
    submitBtn: { background: '#27ae60', color: 'white', border: 'none', borderRadius: '8px', padding: '11px 24px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer' },
    card: { background: 'white', borderRadius: '10px', padding: '24px', border: '1px solid #e0e0e0' },
    cardTitle: { fontSize: '15px', fontWeight: 'bold', color: '#2C3E50', marginBottom: '16px' },
    hint: { fontSize: '13px', color: '#888' },
    table: { width: '100%', borderCollapse: 'collapse', fontSize: '13px' },
    th: { textAlign: 'left', padding: '8px 0', color: '#888', fontWeight: 'normal', borderBottom: '1px solid #e0e0e0' },
    td: { padding: '10px 0', color: '#555', borderBottom: '1px solid #f0f0f0' },
    badge: { fontSize: '11px', padding: '3px 10px', borderRadius: '12px' },
    deleteBtn: { background: '#e53e3e', color: 'white', border: 'none', borderRadius: '6px', padding: '6px 12px', fontSize: '12px', cursor: 'pointer' },
    footer: { background: '#2C3E50', padding: '10px', textAlign: 'center' },
    footerText: { fontSize: '12px', color: '#a0aec0' }
};

export default ManageDoctors;