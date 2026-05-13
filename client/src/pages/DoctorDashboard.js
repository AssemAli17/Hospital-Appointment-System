import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const DoctorDashboard = () => {
    const { user, token, logout } = useAuth();
    const navigate = useNavigate();
    const [appointments, setAppointments] = useState([]);
    const [activeTab, setActiveTab] = useState('home');
    const [rescheduleId, setRescheduleId] = useState(null);
    const [rescheduleDate, setRescheduleDate] = useState('');
    const [rescheduleTime, setRescheduleTime] = useState('');
    const [rescheduleMessage, setRescheduleMessage] = useState('');

    useEffect(() => {
        fetchAppointments();
    }, []);

    const fetchAppointments = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/appointments/doctor', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAppointments(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const handleCancel = async (id) => {
        try {
            await axios.put(`http://localhost:5000/api/appointments/cancel/${id}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchAppointments();
        } catch (err) {
            console.error(err);
        }
    };

    const handleReschedule = async (id) => {
        if (!rescheduleDate || !rescheduleTime) {
            setRescheduleMessage('Please select a new date and time');
            return;
        }
        try {
            await axios.put(`http://localhost:5000/api/appointments/reschedule/${id}`,
                { appointment_date: rescheduleDate, appointment_time: rescheduleTime },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setRescheduleId(null);
            setRescheduleDate('');
            setRescheduleTime('');
            setRescheduleMessage('');
            fetchAppointments();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div style={styles.page}>
            <nav style={styles.navbar}>
                <span style={styles.navTitle}>Hospital Appointment System</span>
                <div style={styles.navRight}>
                    <span style={styles.welcome}>Dr. {user?.first_name} {user?.last_name}</span>
                    <button style={styles.logoutBtn} onClick={handleLogout}>Logout</button>
                </div>
            </nav>
            <div style={styles.body}>
                <div style={styles.sidebar}>
                    <div style={{...styles.sidebarItem, ...(activeTab === 'home' ? styles.activeItem : {})}} onClick={() => setActiveTab('home')}>🏠 Home</div>
                    <div style={{...styles.sidebarItem, ...(activeTab === 'schedule' ? styles.activeItem : {})}} onClick={() => setActiveTab('schedule')}>📅 My Schedule</div>
                    <div style={{...styles.sidebarItem, ...(activeTab === 'patients' ? styles.activeItem : {})}} onClick={() => setActiveTab('patients')}>👥 My Patients</div>
                </div>
                <div style={styles.main}>
                    <h2 style={styles.pageTitle}>Doctor Dashboard</h2>
                    <div style={styles.statsRow}>
                        <div style={styles.statCard}>
                            <p style={styles.statLabel}>Total Appointments</p>
                            <p style={styles.statValue}>{appointments.length}</p>
                        </div>
                        <div style={styles.statCard}>
                            <p style={styles.statLabel}>Confirmed</p>
                            <p style={styles.statValue}>{appointments.filter(a => a.status === 'confirmed').length}</p>
                        </div>
                        <div style={styles.statCard}>
                            <p style={styles.statLabel}>Pending</p>
                            <p style={styles.statValue}>{appointments.filter(a => a.status === 'pending').length}</p>
                        </div>
                    </div>
                    <div style={styles.card}>
                        <h3 style={styles.cardTitle}>📅 My Appointments</h3>
                        {appointments.length === 0 ? (
                            <p style={styles.hint}>No appointments yet</p>
                        ) : (
                            appointments.map(appt => (
                                <div key={appt.appointment_id} style={styles.apptCard}>
                                    <div style={styles.apptHeader}>
                                        <span style={styles.apptPatient}>{appt.patient_first_name} {appt.patient_last_name}</span>
                                        <span style={{...styles.badge, background: appt.status === 'confirmed' ? '#e3f2fd' : appt.status === 'cancelled' ? '#fce8e8' : '#fff8e1', color: appt.status === 'confirmed' ? '#1565c0' : appt.status === 'cancelled' ? '#c62828' : '#f57f17'}}>{appt.status}</span>
                                    </div>
                                    <p style={styles.apptInfo}>{appt.department}</p>
                                    <p style={styles.apptInfo}>{new Date(appt.appointment_date).toLocaleDateString()} at {appt.appointment_time}</p>
                                    {appt.status !== 'cancelled' && (
                                        <div style={styles.btnRow}>
                                            <button style={styles.cancelBtn} onClick={() => handleCancel(appt.appointment_id)}>Cancel</button>
                                            <button style={styles.rescheduleBtn} onClick={() => setRescheduleId(appt.appointment_id)}>Reschedule</button>
                                        </div>
                                    )}
                                    {rescheduleId === appt.appointment_id && (
                                        <div style={styles.rescheduleBox}>
                                            <p style={styles.rescheduleTitle}>Select new date and time</p>
                                            <input
                                                style={styles.input}
                                                type="date"
                                                value={rescheduleDate}
                                                onChange={(e) => setRescheduleDate(e.target.value)}
                                                min={new Date().toISOString().split('T')[0]}
                                            />
                                            <input
                                                style={{...styles.input, marginTop: '8px'}}
                                                type="time"
                                                value={rescheduleTime}
                                                onChange={(e) => setRescheduleTime(e.target.value)}
                                            />
                                            {rescheduleMessage && <p style={{color: 'red', fontSize: '12px'}}>{rescheduleMessage}</p>}
                                            <div style={styles.btnRow}>
                                                <button style={styles.bookBtn} onClick={() => handleReschedule(appt.appointment_id)}>Confirm</button>
                                                <button style={styles.cancelBtn} onClick={() => setRescheduleId(null)}>Cancel</button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
            <footer style={styles.footer}>
                <span style={styles.footerText}>2026 Hospital Appointment System</span>
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
    statsRow: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' },
    statCard: { background: 'white', borderRadius: '10px', padding: '20px', border: '1px solid #e0e0e0' },
    statLabel: { fontSize: '12px', color: '#888', marginBottom: '8px' },
    statValue: { fontSize: '30px', fontWeight: 'bold', color: '#2C3E50', margin: 0 },
    card: { background: 'white', borderRadius: '10px', padding: '24px', border: '1px solid #e0e0e0' },
    cardTitle: { fontSize: '15px', fontWeight: 'bold', color: '#2C3E50', marginBottom: '16px' },
    hint: { fontSize: '13px', color: '#888' },
    apptCard: { border: '1px solid #e0e0e0', borderRadius: '8px', padding: '14px', marginBottom: '12px' },
    apptHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' },
    apptPatient: { fontSize: '13px', fontWeight: 'bold', color: '#2C3E50' },
    badge: { fontSize: '11px', padding: '3px 10px', borderRadius: '12px' },
    apptInfo: { fontSize: '12px', color: '#888', margin: '2px 0' },
    btnRow: { display: 'flex', gap: '8px', marginTop: '10px' },
    cancelBtn: { flex: 1, background: '#e53e3e', color: 'white', border: 'none', borderRadius: '8px', padding: '8px', fontSize: '12px', cursor: 'pointer' },
    rescheduleBtn: { flex: 1, background: '#2C3E50', color: 'white', border: 'none', borderRadius: '8px', padding: '8px', fontSize: '12px', cursor: 'pointer' },
    bookBtn: { flex: 1, background: '#27ae60', color: 'white', border: 'none', borderRadius: '8px', padding: '10px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer' },
    rescheduleBox: { background: '#f0f4f8', border: '1px solid #d0d0d0', borderRadius: '8px', padding: '12px', marginTop: '10px' },
    rescheduleTitle: { fontSize: '12px', fontWeight: 'bold', color: '#2C3E50', marginBottom: '8px' },
    input: { width: '100%', background: '#ffffff', border: '1px solid #d0d0d0', borderRadius: '8px', padding: '10px', fontSize: '13px', boxSizing: 'border-box' },
    footer: { background: '#2C3E50', padding: '10px', textAlign: 'center' },
    footerText: { fontSize: '12px', color: '#a0aec0' }
};

export default DoctorDashboard;