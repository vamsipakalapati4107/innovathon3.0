const express = require('express');
const { auth, requireRole } = require('../middleware/auth');
const {
  getMapData, getRooms, getRoom, createRoom, updateRoom,
} = require('../controllers/roomController');

const router = express.Router();

console.log('Room routes module loaded');

// Debug: Log all requests to room routes
router.use((req, res, next) => {
  console.log(`[Room Router] ${req.method} ${req.path} - Original: ${req.originalUrl}`);
  next();
});

// Test route to verify router is working
router.get('/test', (req, res) => {
  console.log('Test route hit!');
  res.json({ message: 'Room routes are working!' });
});

// Specific routes must come before parameterized routes
// Map data endpoint - only for students and staff
router.get('/map-data', (req, res, next) => {
  console.log('[Room Router] /map-data route matched!');
  next();
}, auth, requireRole(['student', 'staff']), getMapData);
router.get('/', auth, getRooms);
router.get('/:id', auth, getRoom);
router.post('/', auth, requireRole(['admin']), createRoom);
router.put('/:id', auth, requireRole(['admin']), updateRoom);

module.exports = router;
