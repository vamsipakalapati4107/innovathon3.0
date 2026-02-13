const express = require('express');
const { auth } = require('../middleware/auth');
const {
  getEvents, getEvent, createEvent, updateEvent,
} = require('../controllers/eventController');

const router = express.Router();
router.get('/', auth, getEvents);
router.get('/:id', auth, getEvent);
router.post('/', auth, createEvent);
router.put('/:id', auth, updateEvent);

module.exports = router;
