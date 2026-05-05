const express = require('express');
const router = express.Router();
const { analyseSymptoms } = require('../controllers/triageController');
const { verifyToken, isPatient } = require('../middleware/auth');

router.post('/analyse', verifyToken, isPatient, analyseSymptoms);

module.exports = router;