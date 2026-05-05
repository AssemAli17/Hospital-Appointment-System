const express = require('express');
const router = express.Router();
const { bookAppointment, getPatientAppointments, getDoctorAppointments, getAllAppointments, updateAppointmentStatus, cancelAppointment, rescheduleAppointment } = require('../controllers/appointmentController');
const { verifyToken, isAdmin, isDoctor, isPatient } = require('../middleware/auth');

router.post('/', verifyToken, isPatient, bookAppointment);
router.get('/patient', verifyToken, isPatient, getPatientAppointments);
router.get('/doctor', verifyToken, isDoctor, getDoctorAppointments);
router.get('/all', verifyToken, isAdmin, getAllAppointments);
router.put('/status/:id', verifyToken, isAdmin, updateAppointmentStatus);
router.put('/cancel/:id', verifyToken, cancelAppointment);
router.put('/reschedule/:id', verifyToken, rescheduleAppointment);

module.exports = router;