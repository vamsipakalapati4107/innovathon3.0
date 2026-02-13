const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const authRoutes = require('./routes/authRoutes');
const collegeRoutes = require('./routes/collegeRoutes');
const complaintRoutes = require('./routes/complaintRoutes');
const workerRoutes = require('./routes/workerRoutes');
const technicianRoutes = require('./routes/technicianRoutes');
const roomRoutes = require('./routes/roomRoutes');
const eventRoutes = require('./routes/eventRoutes');
const salaryRoutes = require('./routes/salaryRoutes');
const departmentRoutes = require('./routes/departmentRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/colleges', collegeRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/workers', workerRoutes);
app.use('/api/technicians', technicianRoutes);
app.use('/api/rooms', roomRoutes);
console.log('✓ Room routes registered at /api/rooms');
console.log('  Available routes: /api/rooms/test, /api/rooms/map-data, /api/rooms, /api/rooms/:id');
app.use('/api/events', eventRoutes);
app.use('/api/salaries', salaryRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.get('/api/health', (req, res) => res.json({ ok: true }));

// Debug: Log all unmatched routes (this should be last)
// Note: This will only catch routes that don't match any registered routes
app.use('/api/*', (req, res, next) => {
  console.log('⚠️ Unmatched API route (404):', req.method, req.originalUrl);
  console.log('Available routes:', [
    '/api/auth/login',
    '/api/colleges',
    '/api/complaints',
    '/api/workers',
    '/api/technicians',
    '/api/rooms/test',
    '/api/rooms/map-data',
    '/api/rooms',
    '/api/events',
    '/api/salaries',
    '/api/departments',
    '/api/notifications',
    '/api/dashboard/stats'
  ]);
  res.status(404).json({ message: 'Route not found', path: req.originalUrl });
});

app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
  const dataDir = path.join(__dirname, 'data');
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
});
