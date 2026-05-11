const cron = require('node-cron');
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

const sendReminders = async () => {
    try {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowDate = tomorrow.toISOString().split('T')[0];

        const appointments = await pool.query(`
            SELECT a.appointment_id, a.appointment_date, a.appointment_time,
            u.first_name, u.last_name, u.email,
            ud.first_name AS doctor_first_name, ud.last_name AS doctor_last_name,
            dep.name AS department
            FROM appointments a
            JOIN users u ON a.patient_id = u.user_id
            JOIN doctors d ON a.doctor_id = d.doctor_id
            JOIN users ud ON d.user_id = ud.user_id
            JOIN departments dep ON a.department_id = dep.department_id
            WHERE a.appointment_date = $1
            AND a.status = 'pending' OR a.status = 'confirmed'
        `, [tomorrowDate]);

        for (const appt of appointments.rows) {
            await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: appt.email,
                subject: 'Appointment Reminder - Hospital Appointment System',
                html: `
                    <h2>Appointment Reminder</h2>
                    <p>Dear ${appt.first_name} ${appt.last_name},</p>
                    <p>This is a reminder that you have an appointment tomorrow:</p>
                    <div style="background:#f5f5f5;padding:16px;border-radius:8px;margin:16px 0;">
                        <p><strong>Doctor:</strong> Dr. ${appt.doctor_first_name} ${appt.doctor_last_name}</p>
                        <p><strong>Department:</strong> ${appt.department}</p>
                        <p><strong>Date:</strong> ${new Date(appt.appointment_date).toLocaleDateString()}</p>
                        <p><strong>Time:</strong> ${appt.appointment_time}</p>
                    </div>
                    <p>Please make sure to attend your appointment on time.</p>
                    <p>If you need to cancel or reschedule please log in to the Hospital Appointment System.</p>
                    <p>Best regards,<br>Hospital Appointment System</p>
                `
            });

            await pool.query(
                'INSERT INTO notifications (user_id, appointment_id, message, is_sent, sent_at) VALUES ($1, $2, $3, $4, $5)',
                [appt.patient_id, appt.appointment_id, `Reminder sent for appointment on ${appt.appointment_date}`, true, new Date()]
            );

            console.log(`Reminder sent to ${appt.email}`);
        }

        console.log(`Reminder job completed. ${appointments.rows.length} reminders sent.`);
    } catch (err) {
        console.error('Error sending reminders:', err);
    }
};

cron.schedule('0 9 * * *', () => {
    console.log('Running daily appointment reminder job...');
    sendReminders();
});

module.exports = { sendReminders };