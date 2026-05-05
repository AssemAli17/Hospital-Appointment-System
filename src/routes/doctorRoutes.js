const express = require('express');
const router = express.Router();
const { getAllDoctors, getDoctorsByDepartment, updateAvailability, getDoctorProfile } = require('../controllers/doctorController');
const { verifyToken, isDoctor } = require('../middleware/auth');

router.get('/', verifyToken, getAllDoctors);
router.get('/profile', verifyToken, isDoctor, getDoctorProfile);
router.get('/department/:department_id', verifyToken, getDoctorsByDepartment);
router.put('/availability/:doctor_id', verifyToken, isDoctor, updateAvailability);

module.exports = router;