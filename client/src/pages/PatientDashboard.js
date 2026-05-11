import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const PatientDashboard = () => {
    const { user, token, logout } = useAuth();
    const navigate = useNavigate();
    const [appointments, setAppointments] = useState([]);
    const [symptoms, setSymptoms] = useState('');
    const [triageResult, setTriageResult] = useState(null);
    const [triageLoading, setTriageLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('home');
    const [doctors, setDoctors] = useState([]);
    const [showBooking, setShowBooking] = useState(false);
    const [selectedDoctor, setSelectedDoctor] = useState('');
    const [appointmentDate, setAppointmentDate] = useState('');
    const [appointmentTime, setAppointmentTime] = useState('');
    const [bookingMessage, setBookingMessage] = useState('');

    useEffect(() => {
        fetchAppointments();
    }, []);

    const fetchAppointments = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/appointments/patient', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAppointments(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleTriage = async () => {
        setTriageLoading(true);
        setShowBooking(false);
        setBookingMessage('');
        try {
            const res = await axios.post('http://localhost:5000/api/triage/analyse',
                { symptoms },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setTriageResult(res.data);
            if (res.data.department_id) {
                const doctorsRes = await axios.get(`http://localhost:5000/api/doctors/department/${res.data.department_id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setDoctors(doctorsRes.data);
                setShowBooking(true);
            }
        } catch (err) {
            console.error(err);
        }
        setTriageLoading(false);
    };

    const handleBooking = async () => {
        if (!selectedDoctor || !appointmentDate || !appointmentTime) {
            setBookingMessage('Please fill in all booking fields');
            return;
        }
        try {
            await axios.post('http://localhost:5000/api/appointments',
                {
                    doctor_id: selectedDoctor,
                    department_id: triageResult.department_id,
                    appointment_date: appointmentDate,
                    appointment_time: appointmentTime,
                    notes: symptoms
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setBookingMessage('Appointment booked successfully!');
            setShowBooking(false);
            setTriageResult(null);
            setSymptoms('');
            fetchAppointments();
        } catch (err) {
            setBookingMessage('Failed to book appointment. Please try again.');
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
                    <span style={styles.welcome}>Welcome, {user?.first_name}</span>
                    <button style={styles.logoutBtn} onClick={handleLogout}>Logout</button>
                </div>
            </nav>
            <div style={styles.body}>
                <div style={styles.sidebar}>
                    <div style={{...styles.sidebarItem, ...(activeTab === 'home' ? styles.activeItem : {})}} onClick={() => setActiveTab('home')}>🏠 Home</div>
                    <div style={{...styles.sidebarItem, ...(activeTab === 'triage' ? styles.activeItem : {})}} onClick={() => setActiveTab('triage')}>🤖 AI Triage</div>
                    <div style={{...styles.sidebarItem, ...(activeTab === 'appointments' ? styles.activeItem : {})}} onClick={() => setActiveTab('appointments')}>📅 My Appointments</div>
                </div>
                <div style={styles.main}>
                    <h2 style={styles.pageTitle}>Patient Dashboard</h2>
                    <div style={styles.statsRow}>
                        <div style={styles.statCard}>
                            <p style={styles.statLabel}>Upcoming Appointments</p>
                            <p style={styles.statValue}>{appointments.filter(a => a.status !== 'cancelled' && a.status !== 'completed').length}</p>
                        </div>
                        <div style={styles.statCard}>
                            <p style={styles.statLabel}>Past Appointments</p>
                            <p style={styles.statValue}>{appointments.filter(a => a.status === 'completed').length}</p>
                        </div>
                        <div style={styles.statCard}>
                            <p style={styles.statLabel}>Total Appointments</p>
                            <p style={styles.statValue}>{appointments.length}</p>
                        </div>
                    </div>
                    <div style={styles.grid}>
                        <div style={styles.card}>
                            <h3 style={styles.cardTitle}>🤖 AI Symptom Triage</h3>
                            <p style={styles.hint}>Describe your symptoms and we will direct you to the right department</p>
                            <textarea
                                style={styles.textarea}
                                placeholder="e.g. I have been having chest pains and shortness of breath..."
                                value={symptoms}
                                onChange={(e) => setSymptoms(e.target.value)}
                            />
                            <button style={styles.btn} onClick={handleTriage} disabled={triageLoading}>
                                {triageLoading ? 'Analysing...' : 'Analyse Symptoms'}
                            </button>

                            {triageResult && (
                                <div style={styles.triageResult}>
                                    <p style={styles.triageTitle}>AI Recommendation</p>
                                    <p style={styles.triageText}>Recommended Department: <strong>{triageResult.recommended_department}</strong></p>
                                    <p style={styles.triageText}>Reason: {triageResult.reason}</p>
                                    <p style={styles.triageText}>Urgency: <strong>{triageResult.urgency}</strong></p>
                                    <div style={{
                                        marginTop: '10px',
                                        padding: '10px',
                                        borderRadius: '8px',
                                        background: triageResult.urgency === 'High' ? '#fce8e8' : triageResult.urgency === 'Medium' ? '#fff8e1' : '#eaf6ee',
                                        border: `1px solid ${triageResult.urgency === 'High' ? '#ef9a9a' : triageResult.urgency === 'Medium' ? '#ffe082' : '#b2dfdb'}`
                                    }}>
                                        <p style={{
                                            fontSize: '13px',
                                            fontWeight: 'bold',
                                            color: triageResult.urgency === 'High' ? '#c62828' : triageResult.urgency === 'Medium' ? '#f57f17' : '#2e7d32',
                                            margin: 0
                                        }}>
                                            {triageResult.emergency_advice}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {showBooking && (
                                <div style={styles.bookingSection}>
                                    <h4 style={styles.bookingTitle}>📅 Book an Appointment</h4>
                                    <p style={styles.hint}>Available doctors in {triageResult?.recommended_department}</p>

                                    <div style={styles.formGroup}>
                                        <label style={styles.label}>Select Doctor</label>
                                        <select style={styles.select} value={selectedDoctor} onChange={(e) => setSelectedDoctor(e.target.value)}>
                                            <option value="">Choose a doctor</option>
                                            {doctors.map(doc => (
                                                <option key={doc.doctor_id} value={doc.doctor_id}>
                                                    Dr. {doc.first_name} {doc.last_name} — {doc.specialisation}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div style={styles.formGroup}>
                                        <label style={styles.label}>Date</label>
                                        <input
                                            style={styles.input}
                                            type="date"
                                            value={appointmentDate}
                                            onChange={(e) => setAppointmentDate(e.target.value)}
                                            min={new Date().toISOString().split('T')[0]}
                                        />
                                    </div>

                                    <div style={styles.formGroup}>
                                        <label style={styles.label}>Time</label>
                                        <input
                                            style={styles.input}
                                            type="time"
                                            value={appointmentTime}
                                            onChange={(e) => setAppointmentTime(e.target.value)}
                                        />
                                    </div>

                                    <button style={styles.bookBtn} onClick={handleBooking}>Confirm Booking</button>
                                </div>
                            )}

                            {bookingMessage && (
                                <p style={{
                                    marginTop: '12px',
                                    padding: '10px',
                                    borderRadius: '8px',
                                    background: bookingMessage.includes('successfully') ? '#eaf6ee' : '#fce8e8',
                                    color: bookingMessage.includes('successfully') ? '#2e7d32' : '#c62828',
                                    fontSize: '13px',
                                    fontWeight: 'bold'
                                }}>
                                    {bookingMessage}
                                </p>
                            )}
                        </div>

                        <div style={styles.card}>
                            <h3 style={styles.cardTitle}>📅 My Appointments</h3>
                            {appointments.length === 0 ? (
                                <p style={styles.hint}>No appointments yet</p>
                            ) : (
                                appointments.slice(0, 3).map(appt => (
                                    <div key={appt.appointment_id} style={styles.apptCard}>
                                        <div style={styles.apptHeader}>
                                            <span style={styles.apptDoctor}>Dr. {appt.doctor_first_name} {appt.doctor_last_name}</span>
                                            <span style={{...styles.badge, background: appt.status === 'confirmed' ? '#e3f2fd' : '#fff8e1', color: appt.status === 'confirmed' ? '#1565c0' : '#f57f17'}}>{appt.status}</span>
                                        </div>
                                        <p style={styles.apptInfo}>{appt.department}</p>
                                        <p style={styles.apptInfo}>{new Date(appt.appointment_date).toLocaleDateString()} — {appt.appointment_time}</p>
                                    </div>
                                ))
                            )}
                        </div>
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
    statsRow: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' },
    statCard: { background: 'white', borderRadius: '10px', padding: '20px', border: '1px solid #e0e0e0' },
    statLabel: { fontSize: '12px', color: '#888', marginBottom: '8px' },
    statValue: { fontSize: '30px', fontWeight: 'bold', color: '#2C3E50', margin: 0 },
    grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' },
    card: { background: 'white', borderRadius: '10px', padding: '24px', border: '1px solid #e0e0e0' },
    cardTitle: { fontSize: '15px', fontWeight: 'bold', color: '#2C3E50', marginBottom: '14px' },
    hint: { fontSize: '12px', color: '#888', marginBottom: '10px' },
    textarea: { width: '100%', background: '#f5f5f5', border: '1px solid #d0d0d0', borderRadius: '8px', padding: '12px', fontSize: '13px', minHeight: '80px', resize: 'none', fontFamily: 'Arial, sans-serif', boxSizing: 'border-box', marginBottom: '12px' },
    btn: { width: '100%', background: '#2C3E50', color: 'white', border: 'none', borderRadius: '8px', padding: '11px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', marginBottom: '8px' },
    triageResult: { background: '#eaf6ee', border: '1px solid #b2dfdb', borderRadius: '8px', padding: '14px', marginTop: '14px' },
    triageTitle: { fontSize: '12px', color: '#2e7d32', fontWeight: 'bold', marginBottom: '6px' },
    triageText: { fontSize: '13px', color: '#2e7d32', margin: '4px 0' },
    bookingSection: { background: '#f0f4f8', border: '1px solid #d0d0d0', borderRadius: '8px', padding: '16px', marginTop: '14px' },
    bookingTitle: { fontSize: '14px', fontWeight: 'bold', color: '#2C3E50', marginBottom: '10px' },
    formGroup: { marginBottom: '12px' },
    label: { display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#555', marginBottom: '5px' },
    select: { width: '100%', background: '#ffffff', border: '1px solid #d0d0d0', borderRadius: '8px', padding: '10px', fontSize: '13px', boxSizing: 'border-box' },
    input: { width: '100%', background: '#ffffff', border: '1px solid #d0d0d0', borderRadius: '8px', padding: '10px', fontSize: '13px', boxSizing: 'border-box' },
    bookBtn: { width: '100%', background: '#27ae60', color: 'white', border: 'none', borderRadius: '8px', padding: '11px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer' },
    apptCard: { border: '1px solid #e0e0e0', borderRadius: '8px', padding: '14px', marginBottom: '12px' },
    apptHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' },
    apptDoctor: { fontSize: '13px', fontWeight: 'bold', color: '#2C3E50' },
    badge: { fontSize: '11px', padding: '3px 10px', borderRadius: '12px' },
    apptInfo: { fontSize: '12px', color: '#888', margin: '2px 0' },
    footer: { background: '#2C3E50', padding: '10px', textAlign: 'center' },
    footerText: { fontSize: '12px', color: '#a0aec0' }
};

export default PatientDashboard;