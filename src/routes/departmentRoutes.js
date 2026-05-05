const express = require('express');
const router = express.Router();
const { getAllDepartments, createDepartment, deleteDepartment } = require('../controllers/departmentController');
const { verifyToken, isAdmin } = require('../middleware/auth');

router.get('/', verifyToken, getAllDepartments);
router.post('/', verifyToken, isAdmin, createDepartment);
router.delete('/:id', verifyToken, isAdmin, deleteDepartment);

module.exports = router;