const express = require('express');
const { auth, requireRole } = require('../middleware/auth');
const {
  getTechnicians, getTechnician, createTechnician, updateTechnician, deleteTechnician,
} = require('../controllers/technicianController');

const router = express.Router();
router.get('/', auth, getTechnicians);
router.get('/:id', auth, getTechnician);
router.post('/', auth, requireRole(['admin']), createTechnician);
router.put('/:id', auth, updateTechnician);
router.delete('/:id', auth, requireRole(['admin']), deleteTechnician);

module.exports = router;
