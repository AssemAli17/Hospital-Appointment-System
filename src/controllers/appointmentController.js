const pool = require('../config/db');
const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const bookAppointment = async (req, res) => {
    const { doctor_id, department_id, appointment_date, appointment_time, notes } = req.body;
    const patient_id = req.user.user_id;
    try {
        const result = await pool.query(
            `INSERT INTO appointments (patient_id, doctor_id, department_id, appointment_date, appointment_time, notes)
            VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [patient_id, doctor_id, department_id, appointment_date, appointment_time, notes]
        );

        const appointment = result.rows[0];

        const patientRes = await pool.query('SELECT * FROM users WHERE user_id = $1', [patient_id]);
        const doctorRes = await pool.query(`
            SELECT u.first_name, u.last_name FROM doctors d
            JOIN users u ON d.user_id = u.user_id
            WHERE d.doctor_id = $1
        `, [doctor_id]);
        const deptRes = await pool.query('SELECT name FROM departments WHERE department_id = $1', [department_id]);

        const patient = patientRes.rows[0];
        const doctor = doctorRes.rows[0];
        const department = deptRes.rows[0];

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: patient.email,
            subject: 'Appointment Confirmation - Hospital Appointment System',
            html: `
                <h2>Appointment Confirmed</h2>
                <p>Dear ${patient.first_name} ${patient.last_name},</p>
                <p>Your appointment has been successfully booked. Here are the details:</p>
                <div style="background:#f5f5f5;padding:16px;border-radius:8px;margin:16px 0;">
                    <p><strong>Doctor:</strong> Dr. ${doctor.first_name} ${doctor.last_name}</p>
                    <p><strong>Department:</strong> ${department.name}</p>
                    <p><strong>Date:</strong> ${new Date(appointment_date).toLocaleDateString()}</p>
                    <p><strong>Time:</strong> ${appointment_time}</p>
                    <p><strong>Status:</strong> Pending</p>
                </div>
                <p>You will receive a reminder email 24 hours before your appointment.</p>
                <p>If you need to cancel or reschedule please log in to the Hospital Appointment System.</p>
                <p>Best regards,<br>Hospital Appointment System</p>
            `
        });

        res.status(201).json({ message: 'Appointment booked successfully', appointment: result.rows[0] });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error' });
    }
};

const getPatientAppointments = async (req, res) => {
    const patient_id = req.user.user_id;
    try {
        const result = await pool.query(`
            SELECT a.appointment_id, a.appointment_date, a.appointment_time, a.status, a.notes,
            u.first_name AS doctor_first_name, u.last_name AS doctor_last_name,
            dep.name AS department
            FROM appointments a
            JOIN doctors d ON a.doctor_id = d.doctor_id
            JOIN users u ON d.user_id = u.user_id
            JOIN departments dep ON a.department_id = dep.department_id
            WHERE a.patient_id = $1
            ORDER BY a.appointment_date DESC
        `, [patient_id]);
        res.status(200).json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error' });
    }
};

const getDoctorAppointments = async (req, res) => {
    const { user_id } = req.user;
    try {
        const doctor = await pool.query('SELECT doctor_id FROM doctors WHERE user_id = $1', [user_id]);
        const doctor_id = doctor.rows[0].doctor_id;
        const result = await pool.query(`
            SELECT a.appointment_id, a.appointment_date, a.appointment_time, a.status, a.notes,
            u.first_name AS patient_first_name, u.last_name AS patient_last_name,
            dep.name AS department
            FROM appointments a
            JOIN users u ON a.patient_id = u.user_id
            JOIN departments dep ON a.department_id = dep.department_id
            WHERE a.doctor_id = $1
            ORDER BY a.appointment_date ASC
        `, [doctor_id]);
        res.status(200).json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error' });
    }
};

const getAllAppointments = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT a.appointment_id, a.appointment_date, a.appointment_time, a.status,
            up.first_name AS patient_first_name, up.last_name AS patient_last_name,
            ud.first_name AS doctor_first_name, ud.last_name AS doctor_last_name,
            dep.name AS department
            FROM appointments a
            JOIN users up ON a.patient_id = up.user_id
            JOIN doctors d ON a.doctor_id = d.doctor_id
            JOIN users ud ON d.user_id = ud.user_id
            JOIN departments dep ON a.department_id = dep.department_id
            ORDER BY a.appointment_date DESC
        `);
        res.status(200).json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error' });
    }
};

const updateAppointmentStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    try {
        const result = await pool.query(
            'UPDATE appointments SET status = $1 WHERE appointment_id = $2 RETURNING *',
            [status, id]
        );
        res.status(200).json({ message: 'Appointment updated', appointment: result.rows[0] });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error' });
    }
};

const cancelAppointment = async (req, res) => {
    const { id } = req.params;
    const { user_id, role } = req.user;
    try {
        const appointment = await pool.query('SELECT * FROM appointments WHERE appointment_id = $1', [id]);
        if (appointment.rows.length === 0) {
            return res.status(404).json({ message: 'Appointment not found' });
        }
        if (role === 'patient' && appointment.rows[0].patient_id !== user_id) {
            return res.status(403).json({ message: 'Not authorised to cancel this appointment' });
        }
        await pool.query(
            'UPDATE appointments SET status = $1 WHERE appointment_id = $2',
            ['cancelled', id]
        );
        res.status(200).json({ message: 'Appointment cancelled successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error' });
    }
};

const rescheduleAppointment = async (req, res) => {
    const { id } = req.params;
    const { appointment_date, appointment_time } = req.body;
    try {
        const result = await pool.query(
            'UPDATE appointments SET appointment_date = $1, appointment_time = $2, status = $3 WHERE appointment_id = $4 RETURNING *',
            [appointment_date, appointment_time, 'pending', id]
        );
        res.status(200).json({ message: 'Appointment rescheduled successfully', appointment: result.rows[0] });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { bookAppointment, getPatientAppointments, getDoctorAppointments, getAllAppointments, updateAppointmentStatus, cancelAppointment, rescheduleAppointment };