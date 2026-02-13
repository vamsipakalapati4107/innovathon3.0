const express = require('express');
const { auth } = require('../middleware/auth');
const { getDepartments, updateDepartment } = require('../controllers/departmentController');

const router = express.Router();
router.get('/', auth, getDepartments);
router.put('/:id', auth, updateDepartment);

module.exports = router;
