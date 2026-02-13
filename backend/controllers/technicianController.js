const { readData, writeData, generateId } = require('../utils/fileHandler');

function getTechnicians(req, res) {
  try {
    const { collegeId } = req.query;
    if (!collegeId) return res.status(400).json({ message: 'collegeId is required' });
    const technicians = readData('technicians').filter(t => t.collegeId === collegeId);
    res.json(technicians);
  } catch (err) {
    console.error('getTechnicians error:', err);
    res.status(500).json({ message: 'Server error' });
  }
}

function getTechnician(req, res) {
  try {
    const technicians = readData('technicians');
    const technician = technicians.find(t => t._id === req.params.id);
    if (!technician) return res.status(404).json({ message: 'Technician not found' });
    res.json(technician);
  } catch (err) {
    console.error('getTechnician error:', err);
    res.status(500).json({ message: 'Server error' });
  }
}

function createTechnician(req, res) {
  try {
    const { name, phone, department, role, experience, joiningDate, collegeId, companyName } = req.body;
    if (!name || !phone || !department || !role || !collegeId) {
      return res.status(400).json({ message: 'name, phone, department, role, and collegeId are required' });
    }
    const technicians = readData('technicians');
    const technician = {
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
      companyName: companyName || null,
      isInternal: false,
      userId: null,
    };
    technicians.push(technician);
    writeData('technicians', technicians);
    res.status(201).json(technician);
  } catch (err) {
    console.error('createTechnician error:', err);
    res.status(500).json({ message: 'Server error' });
  }
}

function updateTechnician(req, res) {
  try {
    const technicians = readData('technicians');
    const idx = technicians.findIndex(t => t._id === req.params.id);
    if (idx === -1) return res.status(404).json({ message: 'Technician not found' });

    const allowed = [
      'name', 'phone', 'department', 'role', 'experience', 'joiningDate',
      'availabilityStatus', 'complaintsAssigned', 'eventsAssigned', 'performanceRating',
      'companyName', 'userId'
    ];
    for (const key of allowed) {
      if (req.body[key] !== undefined) technicians[idx][key] = req.body[key];
    }
    writeData('technicians', technicians);
    res.json(technicians[idx]);
  } catch (err) {
    console.error('updateTechnician error:', err);
    res.status(500).json({ message: 'Server error' });
  }
}

function deleteTechnician(req, res) {
  try {
    const technicians = readData('technicians');
    const filtered = technicians.filter(t => t._id !== req.params.id);
    if (filtered.length === technicians.length) return res.status(404).json({ message: 'Technician not found' });
    writeData('technicians', filtered);
    res.status(204).send();
  } catch (err) {
    console.error('deleteTechnician error:', err);
    res.status(500).json({ message: 'Server error' });
  }
}

module.exports = { 
  getTechnicians, 
  getTechnician, 
  createTechnician, 
  updateTechnician, 
  deleteTechnician 
};
