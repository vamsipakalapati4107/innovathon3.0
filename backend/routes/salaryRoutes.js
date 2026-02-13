const express = require('express');
const { auth } = require('../middleware/auth');
const {
  getSalaries, getWorkerSalaries, getMySalaries, createSalary, updateSalary,
} = require('../controllers/salaryController');

const router = express.Router();
router.get('/', auth, getSalaries);
router.get('/me', auth, getMySalaries);
router.get('/worker/:workerId', auth, getWorkerSalaries);
router.post('/', auth, createSalary);
router.put('/:id', auth, updateSalary);

module.exports = router;
