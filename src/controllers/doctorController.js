const pool = require('../config/db');

const getAllDoctors = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT d.doctor_id, u.first_name, u.last_name, u.email, u.phone,
            d.specialisation, d.bio, d.is_available, dep.name AS department
            FROM doctors d
            JOIN users u ON d.user_id = u.user_id
            JOIN departments dep ON d.department_id = dep.department_id
            ORDER BY u.last_name
        `);
        res.status(200).json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error' });
    }
};

const getDoctorsByDepartment = async (req, res) => {
    const { department_id } = req.params;
    try {
        const result = await pool.query(`
            SELECT d.doctor_id, u.first_name, u.last_name, u.email,
            d.specialisation, d.bio, d.is_available
            FROM doctors d
            JOIN users u ON d.user_id = u.user_id
            WHERE d.department_id = $1 AND d.is_available = true
            ORDER BY u.last_name
        `, [department_id]);
        res.status(200).json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error' });
    }
};

const updateAvailability = async (req, res) => {
    const { doctor_id } = req.params;
    const { is_available } = req.body;
    try {
        const result = await pool.query(
            'UPDATE doctors SET is_available = $1 WHERE doctor_id = $2 RETURNING *',
            [is_available, doctor_id]
        );
        res.status(200).json({ message: 'Availability updated', doctor: result.rows[0] });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error' });
    }
};

const getDoctorProfile = async (req, res) => {
    const { user_id } = req.user;
    try {
        const result = await pool.query(`
            SELECT d.doctor_id, u.first_name, u.last_name, u.email, u.phone,
            d.specialisation, d.bio, d.is_available, dep.name AS department
            FROM doctors d
            JOIN users u ON d.user_id = u.user_id
            JOIN departments dep ON d.department_id = dep.department_id
            WHERE d.user_id = $1
        `, [user_id]);
        res.status(200).json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error' });
    }
};

const addDoctor = async (req, res) => {
    const { user_id, department_id, specialisation } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO doctors (user_id, department_id, specialisation, is_available) VALUES ($1, $2, $3, true) RETURNING *',
            [user_id, department_id, specialisation]
        );
        res.status(201).json({ message: 'Doctor added successfully', doctor: result.rows[0] });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error' });
    }
};

const deleteDoctor = async (req, res) => {
    const { doctor_id } = req.params;
    try {
        await pool.query('DELETE FROM doctors WHERE doctor_id = $1', [doctor_id]);
        res.status(200).json({ message: 'Doctor removed successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { getAllDoctors, getDoctorsByDepartment, updateAvailability, getDoctorProfile, addDoctor, deleteDoctor };