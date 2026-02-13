const { readData } = require('../utils/fileHandler');

function getColleges(req, res) {
  try {
    const colleges = readData('colleges');
    res.json(colleges);
  } catch (err) {
    console.error('getColleges error:', err);
    res.status(500).json({ message: 'Server error' });
  }
}

function getCollege(req, res) {
  try {
    const colleges = readData('colleges');
    const college = colleges.find(c => c._id === req.params.id);
    if (!college) return res.status(404).json({ message: 'College not found' });
    res.json(college);
  } catch (err) {
    console.error('getCollege error:', err);
    res.status(500).json({ message: 'Server error' });
  }
}

module.exports = { getColleges, getCollege };
