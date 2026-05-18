import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
    const { user, token, logout } = useAuth();
    const navigate = useNavigate();
    const [appointments, setAppointments] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [activeTab, setActiveTab] = useState('home');

    useEffect(() => {
        fetchAppointments();
        fetchDoctors();
    }, []);

    const fetchAppointments = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/appointments/all', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAppointments(res.data);
        } catch (err) {
            console.error(err);
        }
    };

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
                    <div style={{...styles.sidebarItem, ...(activeTab === 'home' ? styles.activeItem : {})}} onClick={() => setActiveTab('home')}>📊 Dashboard</div>
                    <div style={{...styles.sidebarItem, ...(activeTab === 'doctors' ? styles.activeItem : {})}} onClick={() => navigate('/admin/manage-doctors')}>👨‍⚕️ Manage Doctors</div>
                    <div style={{...styles.sidebarItem, ...(activeTab === 'appointments' ? styles.activeItem : {})}} onClick={() => setActiveTab('appointments')}>📅 Appointments</div>
                    <div style={{...styles.sidebarItem, ...(activeTab === 'users' ? styles.activeItem : {})}} onClick={() => setActiveTab('users')}>👥 User Accounts</div>
                </div>
                <div style={styles.main}>
                    <h2 style={styles.pageTitle}>Admin Dashboard</h2>
                    <div style={styles.statsRow}>
                        <div style={styles.statCard}>
                            <p style={styles.statLabel}>Total Appointments</p>
                            <p style={styles.statValue}>{appointments.length}</p>
                        </div>
                        <div style={styles.statCard}>
                            <p style={styles.statLabel}>Total Doctors</p>
                            <p style={styles.statValue}>{doctors.length}</p>
                        </div>
                        <div style={styles.statCard}>
                            <p style={styles.statLabel}>Confirmed</p>
                            <p style={styles.statValue}>{appointments.filter(a => a.status === 'confirmed').length}</p>
                        </div>
                        <div style={styles.statCard}>
                            <p style={styles.statLabel}>Cancelled</p>
                            <p style={{...styles.statValue, color: '#e53e3e'}}>{appointments.filter(a => a.status === 'cancelled').length}</p>
                        </div>
                    </div>
                    <div style={styles.card}>
                        <h3 style={styles.cardTitle}>📋 Recent Appointments</h3>
                        <table style={styles.table}>
                            <thead>
                                <tr>
                                    <th style={styles.th}>Patient</th>
                                    <th style={styles.th}>Doctor</th>
                                    <th style={styles.th}>Department</th>
                                    <th style={styles.th}>Date</th>
                                    <th style={styles.th}>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {appointments.slice(0, 10).map(appt => (
                                    <tr key={appt.appointment_id}>
                                        <td style={styles.td}>{appt.patient_first_name} {appt.patient_last_name}</td>
                                        <td style={styles.td}>Dr. {appt.doctor_first_name} {appt.doctor_last_name}</td>
                                        <td style={styles.td}>{appt.department}</td>
                                        <td style={styles.td}>{new Date(appt.appointment_date).toLocaleDateString()}</td>
                                        <td style={styles.td}>
                                            <span style={{...styles.badge, background: appt.status === 'confirmed' ? '#e3f2fd' : appt.status === 'cancelled' ? '#fce8e8' : '#fff8e1', color: appt.status === 'confirmed' ? '#1565c0' : appt.status === 'cancelled' ? '#c62828' : '#f57f17'}}>
                                                {appt.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {appointments.length === 0 && <p style={styles.hint}>No appointments yet</p>}
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
    pageTitle: { fontSize: '22px', fontWeight: 'bold', color: '#2C3E50', marginBottom: '24px' },
    statsRow: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' },
    statCard: { background: 'white', borderRadius: '10px', padding: '20px', border: '1px solid #e0e0e0' },
    statLabel: { fontSize: '12px', color: '#888', marginBottom: '8px' },
    statValue: { fontSize: '30px', fontWeight: 'bold', color: '#2C3E50', margin: 0 },
    card: { background: 'white', borderRadius: '10px', padding: '24px', border: '1px solid #e0e0e0' },
    cardTitle: { fontSize: '15px', fontWeight: 'bold', color: '#2C3E50', marginBottom: '16px' },
    table: { width: '100%', borderCollapse: 'collapse', fontSize: '13px' },
    th: { textAlign: 'left', padding: '8px 0', color: '#888', fontWeight: 'normal', borderBottom: '1px solid #e0e0e0' },
    td: { padding: '10px 0', color: '#555', borderBottom: '1px solid #f0f0f0' },
    badge: { fontSize: '11px', padding: '3px 10px', borderRadius: '12px' },
    hint: { fontSize: '13px', color: '#888' },
    footer: { background: '#2C3E50', padding: '10px', textAlign: 'center' },
    footerText: { fontSize: '12px', color: '#a0aec0' }
};

export default AdminDashboard;