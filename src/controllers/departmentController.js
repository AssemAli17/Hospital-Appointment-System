const pool = require('../config/db');

const getAllDepartments = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM departments ORDER BY name');
        res.status(200).json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error' });
    }
};

const createDepartment = async (req, res) => {
    const { name, description } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO departments (name, description) VALUES ($1, $2) RETURNING *',
            [name, description]
        );
        res.status(201).json({ message: 'Department created successfully', department: result.rows[0] });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error' });
    }
};

const deleteDepartment = async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM departments WHERE department_id = $1', [id]);
        res.status(200).json({ message: 'Department deleted successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { getAllDepartments, createDepartment, deleteDepartment };