const express = require('express');
const { auth } = require('../middleware/auth');
const {
  getWorkers, getWorker, createWorker, updateWorker, deleteWorker,
} = require('../controllers/workerController');

const router = express.Router();
router.get('/', auth, getWorkers);
router.get('/:id', auth, getWorker);
router.post('/', auth, createWorker);
router.put('/:id', auth, updateWorker);
router.delete('/:id', auth, deleteWorker);

module.exports = router;
