const { readData, writeData, generateId } = require('../utils/fileHandler');

function getEvents(req, res) {
  try {
    const { collegeId } = req.query;
    if (!collegeId) return res.status(400).json({ message: 'collegeId is required' });
    const events = readData('events').filter(e => e.collegeId === collegeId);
    res.json(events);
  } catch (err) {
    console.error('getEvents error:', err);
    res.status(500).json({ message: 'Server error' });
  }
}

function getEvent(req, res) {
  try {
    const events = readData('events');
    const event = events.find(e => e._id === req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.json(event);
  } catch (err) {
    console.error('getEvent error:', err);
    res.status(500).json({ message: 'Server error' });
  }
}

function createEvent(req, res) {
  try {
    const { eventName, date, startTime, endTime, location, block, description, workerCount, assignedWorkers, departmentAssignments, collegeId, roomId } = req.body;
    if (!eventName || !date || !startTime || !endTime || !location || !collegeId) {
      return res.status(400).json({ message: 'eventName, date, startTime, endTime, location, and collegeId are required' });
    }
    const events = readData('events');
    const event = {
      _id: generateId(),
      eventName,
      date,
      startTime: startTime || '',
      endTime: endTime || '',
      location,
      block: block !== undefined && block !== null ? block : '',
      description: description || '',
      workerCount: (workerCount !== undefined && workerCount !== null && workerCount !== '' && String(workerCount).trim() !== '') ? Number(workerCount) : null,
      assignedWorkers: assignedWorkers || [],
      departmentAssignments: departmentAssignments || {},
      status: 'Upcoming',
      collegeId,
      roomId: roomId || null,
    };
    console.log('Creating event with data:', { eventName, block, workerCount, startTime, endTime });
    events.push(event);
    writeData('events', events);
    res.status(201).json(event);
  } catch (err) {
    console.error('createEvent error:', err);
    res.status(500).json({ message: 'Server error' });
  }
}

function updateEvent(req, res) {
  try {
    const events = readData('events');
    const idx = events.findIndex(e => e._id === req.params.id);
    if (idx === -1) return res.status(404).json({ message: 'Event not found' });

    const allowed = [
      'eventName', 'date', 'startTime', 'endTime', 'location', 'block', 'description',
      'workerCount', 'assignedWorkers', 'departmentAssignments', 'status', 'roomId'
    ];
    for (const key of allowed) {
      if (req.body[key] !== undefined) events[idx][key] = req.body[key];
    }
    writeData('events', events);
    res.json(events[idx]);
  } catch (err) {
    console.error('updateEvent error:', err);
    res.status(500).json({ message: 'Server error' });
  }
}

module.exports = { getEvents, getEvent, createEvent, updateEvent };
