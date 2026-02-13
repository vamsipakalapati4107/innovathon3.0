const { readData, writeData, generateId } = require('../utils/fileHandler');

function getWorkers(req, res) {
  try {
    const { collegeId } = req.query;
    if (!collegeId) return res.status(400).json({ message: 'collegeId is required' });
    const workers = readData('workers').filter(w => w.collegeId === collegeId);
    res.json(workers);
  } catch (err) {
    console.error('getWorkers error:', err);
    res.status(500).json({ message: 'Server error' });
  }
}

function getWorker(req, res) {
  try {
    const workers = readData('workers');
    const worker = workers.find(w => w._id === req.params.id);
    if (!worker) return res.status(404).json({ message: 'Worker not found' });
    res.json(worker);
  } catch (err) {
    console.error('getWorker error:', err);
    res.status(500).json({ message: 'Server error' });
  }
}

function createWorker(req, res) {
  try {
    const { name, phone, department, role, experience, joiningDate, collegeId } = req.body;
    if (!name || !phone || !department || !role || !collegeId) {
      return res.status(400).json({ message: 'name, phone, department, role, and collegeId are required' });
    }
    const workers = readData('workers');
    const worker = {
      _id: generateId(),
      name,
      phone,
      department,
      role,
      experience: Number(experience) || 0,
      joiningDate: joiningDate || new Date().toISOString().slice(0, 10),
      availabilityStatus: 'Available',
      complaintsAssigned: [],
      eventsAssigned: [],
      performanceRating: 0,
      collegeId,
    };
    workers.push(worker);
    writeData('workers', workers);
    res.status(201).json(worker);
  } catch (err) {
    console.error('createWorker error:', err);
    res.status(500).json({ message: 'Server error' });
  }
}

function updateWorker(req, res) {
  try {
    const workers = readData('workers');
    const idx = workers.findIndex(w => w._id === req.params.id);
    if (idx === -1) return res.status(404).json({ message: 'Worker not found' });

    const allowed = [
      'name', 'phone', 'department', 'role', 'experience', 'joiningDate',
      'availabilityStatus', 'complaintsAssigned', 'eventsAssigned', 'performanceRating'
    ];
    for (const key of allowed) {
      if (req.body[key] !== undefined) workers[idx][key] = req.body[key];
    }
    writeData('workers', workers);
    res.json(workers[idx]);
  } catch (err) {
    console.error('updateWorker error:', err);
    res.status(500).json({ message: 'Server error' });
  }
}

function deleteWorker(req, res) {
  try {
    const workers = readData('workers');
    const filtered = workers.filter(w => w._id !== req.params.id);
    if (filtered.length === workers.length) return res.status(404).json({ message: 'Worker not found' });
    writeData('workers', filtered);
    res.status(204).send();
  } catch (err) {
    console.error('deleteWorker error:', err);
    res.status(500).json({ message: 'Server error' });
  }
}

module.exports = { getWorkers, getWorker, createWorker, updateWorker, deleteWorker };
