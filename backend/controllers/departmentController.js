const { readData, writeData } = require('../utils/fileHandler');

const DEPARTMENTS = [
  'Cleaning', 'Electrical', 'Plumbing', 'Infrastructure',
  'Security', 'Washroom Maintenance', 'HVAC'
];

function getDepartments(req, res) {
  try {
    const { collegeId } = req.query;
    if (!collegeId) return res.status(400).json({ message: 'collegeId is required' });

    const workers = readData('workers').filter(w => w.collegeId === collegeId);
    let stored = readData('departments').filter(d => d.collegeId === collegeId);

    const result = DEPARTMENTS.map(name => {
      let existing = stored.find(d => d.name === name);
      const currentCount = workers.filter(w => w.department === name).length;
      if (!existing) {
        existing = { _id: `dept-${collegeId}-${name.replace(/\s/g, '_')}`, name, requiredCount: 10, collegeId };
        stored.push(existing);
        writeData('departments', stored);
      }
      const requiredCount = existing.requiredCount || 10;
      const vacancyCount = Math.max(0, requiredCount - currentCount);
      return {
        _id: existing._id,
        name,
        requiredCount,
        currentCount,
        vacancyCount,
        collegeId,
      };
    });
    res.json(result);
  } catch (err) {
    console.error('getDepartments error:', err);
    res.status(500).json({ message: 'Server error' });
  }
}

function updateDepartment(req, res) {
  try {
    const { requiredCount } = req.body;
    const { id } = req.params;
    const departments = readData('departments');
    let idx = departments.findIndex(d => d._id === id);
    const fullName = id.replace(/^dept-[^-]+-/, '').replace(/_/g, ' ');
    const collegeId = id.replace(/^dept-([^-]+)-.*/, '$1');
    if (idx === -1) {
      const workers = readData('workers').filter(w => w.collegeId === collegeId && w.department === fullName);
      departments.push({
        _id: id,
        name: fullName,
        requiredCount: Number(requiredCount) || 10,
        currentCount: workers.length,
        collegeId,
      });
      idx = departments.length - 1;
    } else if (requiredCount !== undefined) {
      departments[idx].requiredCount = Number(requiredCount);
    }
    writeData('departments', departments);
    const d = departments[idx];
    const workers = readData('workers').filter(w => w.collegeId === d.collegeId && w.department === d.name);
    d.currentCount = workers.length;
    d.vacancyCount = Math.max(0, d.requiredCount - d.currentCount);
    res.json(d);
  } catch (err) {
    console.error('updateDepartment error:', err);
    res.status(500).json({ message: 'Server error' });
  }
}

module.exports = { getDepartments, updateDepartment };
