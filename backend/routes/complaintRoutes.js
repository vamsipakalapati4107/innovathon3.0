const express = require('express');
const { auth, requireRole } = require('../middleware/auth');
const {
  getComplaints, getComplaint, getMyComplaints, getTechnicianComplaints, createComplaint, updateComplaint, getTechniciansByDepartment,
} = require('../controllers/complaintController');

const router = express.Router();
// Specific routes must come before parameterized routes
router.get('/technicians', auth, getTechniciansByDepartment);
router.get('/technician/:userId', auth, getTechnicianComplaints);
router.get('/user/:userId', auth, getMyComplaints);
router.get('/', auth, getComplaints);
router.get('/:id', auth, getComplaint);
// Only students and staff can create complaints
router.post('/', auth, requireRole(['student', 'staff']), createComplaint);
router.put('/:id', auth, updateComplaint);

module.exports = router;
