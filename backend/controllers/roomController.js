const { readData, writeData, generateId } = require('../utils/fileHandler');

function getMapData(req, res) {
  try {
    const { collegeId } = req.query;
    console.log('getMapData called with collegeId:', collegeId);
    if (!collegeId) return res.status(400).json({ message: 'collegeId is required' });

    const allRooms = readData('rooms');
    console.log('Total rooms in database:', allRooms.length);
    const rooms = allRooms.filter(r => r.collegeId === collegeId);
    console.log('Rooms filtered for collegeId', collegeId, ':', rooms.length);
    
    const complaints = readData('complaints').filter(c => c.collegeId === collegeId);
    const events = readData('events').filter(e => e.collegeId === collegeId);
    const technicians = readData('technicians').filter(t => t.collegeId === collegeId);

    // Enrich rooms with complaint and event data
    const mapData = rooms.map(room => {
      // Find complaints linked to this room (by roomId or activeComplaintId)
      const roomComplaint = complaints.find(c => 
        (c.roomId === room._id || room.activeComplaintId === c._id) &&
        ['Submitted', 'Under Review', 'Assigned', 'In Progress'].includes(c.status)
      ) || (room.activeComplaintId 
        ? complaints.find(c => c._id === room.activeComplaintId)
        : null);
      
      // Find events linked to this room (by roomId or activeEventId)
      const roomEvent = events.find(e => 
        (e.roomId === room._id || room.activeEventId === e._id) &&
        e.status === 'Ongoing'
      ) || (room.activeEventId
        ? events.find(e => e._id === room.activeEventId && e.status === 'Ongoing')
        : null);

      // Determine status based on complaint and event
      let status = room.status;
      let statusColor = 'green'; // Available
      
      if (roomComplaint && ['Submitted', 'Under Review', 'Assigned', 'In Progress'].includes(roomComplaint.status)) {
        status = 'Under Maintenance';
        statusColor = 'red';
      } else if (roomEvent && roomEvent.status === 'Ongoing') {
        status = 'Event Ongoing';
        statusColor = 'blue';
      } else if (room.status === 'Reserved') {
        statusColor = 'yellow';
      }

      // Get technician info if complaint is assigned
      let technicianInfo = null;
      if (roomComplaint && roomComplaint.technicianId) {
        const tech = technicians.find(t => t._id === roomComplaint.technicianId);
        if (tech) {
          technicianInfo = {
            name: tech.name,
            phone: tech.phone,
            company: tech.companyName,
          };
        }
      }

      // Calculate estimated resolution time
      let estimatedResolutionTime = null;
      if (roomComplaint && roomComplaint.assignedTimestamp) {
        const assignedTime = new Date(roomComplaint.assignedTimestamp);
        const now = new Date();
        const hoursSinceAssigned = (now - assignedTime) / (1000 * 60 * 60);
        
        // Estimate based on priority
        const priorityHours = {
          'Emergency': 2,
          'High': 4,
          'Medium': 8,
          'Low': 24,
        };
        const estimatedHours = priorityHours[roomComplaint.priorityLevel] || 8;
        const remainingHours = Math.max(0, estimatedHours - hoursSinceAssigned);
        estimatedResolutionTime = remainingHours > 0 ? `${Math.ceil(remainingHours)} hours` : 'Overdue';
      }

      return {
        ...room,
        status,
        statusColor,
        complaint: roomComplaint ? {
          _id: roomComplaint._id,
          title: roomComplaint.title,
          description: roomComplaint.description,
          status: roomComplaint.status,
          priorityLevel: roomComplaint.priorityLevel,
          submittedAt: roomComplaint.submittedAt,
          technicianInfo,
          estimatedResolutionTime,
        } : null,
        event: roomEvent ? {
          _id: roomEvent._id,
          eventName: roomEvent.eventName,
          date: roomEvent.date,
          startTime: roomEvent.startTime || '',
          endTime: roomEvent.endTime || '',
          block: roomEvent.block || '',
          workerCount: roomEvent.workerCount || 0,
          description: roomEvent.description || roomEvent.eventName,
          status: roomEvent.status,
        } : null,
      };
    });

    console.log('Returning mapData with', mapData.length, 'rooms');
    res.json(mapData);
  } catch (err) {
    console.error('getMapData error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

function getRooms(req, res) {
  try {
    const { collegeId } = req.query;
    if (!collegeId) return res.status(400).json({ message: 'collegeId is required' });
    const rooms = readData('rooms').filter(r => r.collegeId === collegeId);
    res.json(rooms);
  } catch (err) {
    console.error('getRooms error:', err);
    res.status(500).json({ message: 'Server error' });
  }
}

function getRoom(req, res) {
  try {
    const rooms = readData('rooms');
    const room = rooms.find(r => r._id === req.params.id);
    if (!room) return res.status(404).json({ message: 'Room not found' });
    res.json(room);
  } catch (err) {
    console.error('getRoom error:', err);
    res.status(500).json({ message: 'Server error' });
  }
}

function createRoom(req, res) {
  try {
    const { roomName, block, floor, status, collegeId, capacity, roomType } = req.body;
    if (!roomName || !block || !floor || !collegeId) {
      return res.status(400).json({ message: 'roomName, block, floor, and collegeId are required' });
    }
    const rooms = readData('rooms');
    const room = {
      _id: generateId(),
      roomName,
      block,
      floor: Number(floor),
      status: status || 'Available',
      activeComplaintId: null,
      activeEventId: null,
      collegeId,
      capacity: capacity ? Number(capacity) : null,
      roomType: roomType || 'General',
    };
    rooms.push(room);
    writeData('rooms', rooms);
    res.status(201).json(room);
  } catch (err) {
    console.error('createRoom error:', err);
    res.status(500).json({ message: 'Server error' });
  }
}

function updateRoom(req, res) {
  try {
    const rooms = readData('rooms');
    const idx = rooms.findIndex(r => r._id === req.params.id);
    if (idx === -1) return res.status(404).json({ message: 'Room not found' });

    const allowed = ['roomName', 'block', 'floor', 'status', 'activeComplaintId', 'activeEventId', 'capacity', 'roomType'];
    for (const key of allowed) {
      if (req.body[key] !== undefined) rooms[idx][key] = req.body[key];
    }
    writeData('rooms', rooms);
    res.json(rooms[idx]);
  } catch (err) {
    console.error('updateRoom error:', err);
    res.status(500).json({ message: 'Server error' });
  }
}

module.exports = { getMapData, getRooms, getRoom, createRoom, updateRoom };
