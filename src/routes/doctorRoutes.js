const express = require('express');
const router = express.Router();
const { getAllDoctors, getDoctorsByDepartment, updateAvailability, getDoctorProfile, addDoctor, deleteDoctor } = require('../controllers/doctorController');
const { verifyToken, isDoctor, isAdmin } = require('../middleware/auth');

router.get('/', verifyToken, getAllDoctors);
router.get('/profile', verifyToken, isDoctor, getDoctorProfile);
router.get('/department/:department_id', verifyToken, getDoctorsByDepartment);
router.put('/availability/:doctor_id', verifyToken, isDoctor, updateAvailability);
router.post('/add', verifyToken, isAdmin, addDoctor);
router.delete('/:doctor_id', verifyToken, isAdmin, deleteDoctor);

module.exports = router;