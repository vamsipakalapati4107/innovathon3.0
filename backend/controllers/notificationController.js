const { readData, writeData } = require('../utils/fileHandler');

function getNotifications(req, res) {
  try {
    const { userId } = req.params;
    const notifications = readData('notifications')
      .filter(n => n.userId === userId)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    res.json(notifications);
  } catch (err) {
    console.error('getNotifications error:', err);
    res.status(500).json({ message: 'Server error' });
  }
}

function markRead(req, res) {
  try {
    const notifications = readData('notifications');
    const idx = notifications.findIndex(n => n._id === req.params.id);
    if (idx === -1) return res.status(404).json({ message: 'Notification not found' });
    notifications[idx].isRead = true;
    writeData('notifications', notifications);
    res.status(204).send();
  } catch (err) {
    console.error('markRead error:', err);
    res.status(500).json({ message: 'Server error' });
  }
}

module.exports = { getNotifications, markRead };
