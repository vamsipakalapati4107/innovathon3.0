const { readData, writeData, generateId } = require('../utils/fileHandler');

function getComplaints(req, res) {
  try {
    const { collegeId } = req.query;
    if (!collegeId) return res.status(400).json({ message: 'collegeId is required' });
    const complaints = readData('complaints').filter(c => c.collegeId === collegeId);
    res.json(complaints);
  } catch (err) {
    console.error('getComplaints error:', err);
    res.status(500).json({ message: 'Server error' });
  }
}

function getComplaint(req, res) {
  try {
    const complaints = readData('complaints');
    const complaint = complaints.find(c => c._id === req.params.id);
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });
    res.json(complaint);
  } catch (err) {
    console.error('getComplaint error:', err);
    res.status(500).json({ message: 'Server error' });
  }
}

function getMyComplaints(req, res) {
  try {
    const { userId } = req.params;
    if (!userId) return res.status(400).json({ message: 'userId is required' });
    const complaints = readData('complaints').filter(c => c.studentId === userId);
    res.json(complaints);
  } catch (err) {
    console.error('getMyComplaints error:', err);
    res.status(500).json({ message: 'Server error' });
  }
}

function getTechnicianComplaints(req, res) {
  try {
    const { userId } = req.params;
    if (!userId) return res.status(400).json({ message: 'userId is required' });
    
    // Find technician record linked to this user
    const technicians = readData('technicians');
    const technician = technicians.find(t => t.userId === userId);
    
    if (!technician) {
      // No technician record found, return empty array
      return res.json([]);
    }
    
    // Get complaints assigned to this technician (by technician record ID)
    const complaints = readData('complaints').filter(c => c.technicianId === technician._id);
    res.json(complaints);
  } catch (err) {
    console.error('getTechnicianComplaints error:', err);
    res.status(500).json({ message: 'Server error' });
  }
}

function createComplaint(req, res) {
  try {
    const { title, description, category, beforeImage, studentId, studentName, collegeId } = req.body;
    if (!title || !description || !category || !studentId || !collegeId) {
      return res.status(400).json({ message: 'title, description, category, studentId, and collegeId are required' });
    }
    const complaints = readData('complaints');
    const complaint = {
      _id: generateId(),
      title,
      description,
      category,
      status: 'Submitted',
      studentId,
      studentName: studentName || null,
      technicianId: null,
      technicianName: null,
      adminRemarks: null,
      beforeImage: beforeImage || null,
      afterImage: null,
      resolutionApproved: null,
      resolutionTime: null,
      submittedAt: new Date().toISOString(),
      collegeId,
    };
    complaints.push(complaint);
    writeData('complaints', complaints);
    res.status(201).json(complaint);
  } catch (err) {
    console.error('createComplaint error:', err);
    res.status(500).json({ message: 'Server error' });
  }
}

function updateComplaint(req, res) {
  try {
    const complaints = readData('complaints');
    const idx = complaints.findIndex(c => c._id === req.params.id);
    if (idx === -1) return res.status(404).json({ message: 'Complaint not found' });

    const allowed = [
      'status', 'priorityLevel', 'technicianId', 'technicianName', 'adminRemarks',
      'afterImage', 'resolutionApproved', 'resolutionTime',
      'reviewTimestamp', 'approvalTimestamp', 'assignedTimestamp', 'arrivalTimestamp', 'resolvedTimestamp'
    ];
    for (const key of allowed) {
      if (req.body[key] !== undefined) complaints[idx][key] = req.body[key];
    }
    
    // If assigning technician, update timestamps
    if (req.body.technicianId && !complaints[idx].assignedTimestamp) {
      complaints[idx].assignedTimestamp = new Date().toISOString();
      if (complaints[idx].status === 'Submitted' || complaints[idx].status === 'Under Review') {
        complaints[idx].status = 'Assigned';
      }
    }

    // If resolved, ensure resolvedTimestamp is set
    if (complaints[idx].status === 'Resolved' && !complaints[idx].resolvedTimestamp) {
      complaints[idx].resolvedTimestamp = new Date().toISOString();
    }
    
    writeData('complaints', complaints);
    res.json(complaints[idx]);
  } catch (err) {
    console.error('updateComplaint error:', err);
    res.status(500).json({ message: 'Server error' });
  }
}

function getTechniciansByDepartment(req, res) {
  try {
    const { department, collegeId } = req.query;
    
    console.log('getTechniciansByDepartment called with:', { department, collegeId });
    
    if (!department || !collegeId) {
      console.error('Missing required parameters:', { department, collegeId });
      return res.status(400).json({ message: 'department and collegeId are required' });
    }
    
    // Get technicians (external contractors), not workers (internal staff)
    const technicians = readData('technicians');
    console.log(`Total technicians in database: ${technicians.length}`);
    
    // Filter technicians by exact department match and college, exclude 'On Leave' status
    const filteredTechnicians = technicians.filter(
      t => t.department === department && 
           t.collegeId === collegeId && 
           t.availabilityStatus !== 'On Leave'
    );
    
    console.log(`Filtered technicians: ${filteredTechnicians.length} for department "${department}" and college "${collegeId}"`);
    
    // Sort by availability status (Available first, then Assigned)
    filteredTechnicians.sort((a, b) => {
      if (a.availabilityStatus === 'Available' && b.availabilityStatus !== 'Available') return -1;
      if (a.availabilityStatus !== 'Available' && b.availabilityStatus === 'Available') return 1;
      return 0;
    });
    
    console.log(`Returning ${filteredTechnicians.length} technicians for department "${department}"`);
    
    res.json(filteredTechnicians);
  } catch (err) {
    console.error('getTechniciansByDepartment error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

module.exports = { 
  getComplaints, 
  getComplaint, 
  getMyComplaints,
  getTechnicianComplaints,
  createComplaint, 
  updateComplaint,
  getTechniciansByDepartment
};
