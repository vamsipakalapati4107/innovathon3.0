const express = require('express');
const { auth } = require('../middleware/auth');
const { getNotifications, markRead } = require('../controllers/notificationController');

const router = express.Router();
router.get('/:userId', auth, getNotifications);
router.put('/:id/read', auth, markRead);

module.exports = router;
