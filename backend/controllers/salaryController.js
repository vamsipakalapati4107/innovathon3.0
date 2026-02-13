const { readData, writeData, generateId } = require('../utils/fileHandler');

function getSalaries(req, res) {
  try {
    const { collegeId } = req.query;
    if (!collegeId) return res.status(400).json({ message: 'collegeId is required' });
    const salaries = readData('salaries').filter(s => s.collegeId === collegeId);
    res.json(salaries);
  } catch (err) {
    console.error('getSalaries error:', err);
    res.status(500).json({ message: 'Server error' });
  }
}

function getWorkerSalaries(req, res) {
  try {
    const { workerId } = req.params;
    const salaries = readData('salaries').filter(s => 
      (s.recipientId === workerId && s.recipientType === 'worker') || 
      (s.workerId === workerId) // Legacy support
    );
    res.json(salaries);
  } catch (err) {
    console.error('getWorkerSalaries error:', err);
    res.status(500).json({ message: 'Server error' });
  }
}

function updateSalary(req, res) {
  try {
    const salaries = readData('salaries');
    const idx = salaries.findIndex(s => s._id === req.params.id);
    if (idx === -1) return res.status(404).json({ message: 'Salary record not found' });

    const allowed = ['paymentStatus', 'baseSalary', 'bonus', 'deductions'];
    for (const key of allowed) {
      if (req.body[key] !== undefined) {
        salaries[idx][key] = req.body[key];
      }
    }
    
    // Recalculate total if salary components changed
    if (req.body.baseSalary !== undefined || req.body.bonus !== undefined || req.body.deductions !== undefined) {
      salaries[idx].totalSalary = (salaries[idx].baseSalary || 0) + (salaries[idx].bonus || 0) - (salaries[idx].deductions || 0);
    }
    
    writeData('salaries', salaries);
    res.json(salaries[idx]);
  } catch (err) {
    console.error('updateSalary error:', err);
    res.status(500).json({ message: 'Server error' });
  }
}

function getMySalaries(req, res) {
  try {
    const userId = req.user._id || req.user.userId;
    const salaries = readData('salaries');
    
    // Check if user is a worker
    const workers = readData('workers');
    const worker = workers.find(w => w.userId === userId);
    if (worker) {
      const workerSalaries = salaries.filter(s => 
        (s.recipientId === worker._id && s.recipientType === 'worker') || 
        (s.workerId === worker._id) // Legacy support
      );
      return res.json(workerSalaries);
    }
    
    // Check if user is a technician
    const technicians = readData('technicians');
    const technician = technicians.find(t => t.userId === userId);
    if (technician) {
      const techSalaries = salaries.filter(s => 
        s.recipientId === technician._id && s.recipientType === 'technician'
      );
      return res.json(techSalaries);
    }
    
    res.json([]);
  } catch (err) {
    console.error('getMySalaries error:', err);
    res.status(500).json({ message: 'Server error' });
  }
}

function createSalary(req, res) {
  try {
    const { recipientId, recipientType, recipientName, workerId, workerName, month, baseSalary, bonus, deductions, paymentStatus, collegeId } = req.body;
    
    // Support both new format (recipientId/recipientType) and legacy format (workerId)
    const id = recipientId || workerId;
    const type = recipientType || 'worker';
    
    if (!id || !month || !collegeId) {
      return res.status(400).json({ message: 'recipientId (or workerId), month, and collegeId are required' });
    }
    
    const base = Number(baseSalary) || 0;
    const b = Number(bonus) || 0;
    const d = Number(deductions) || 0;
    const total = base + b - d;
    const salaries = readData('salaries');
    
    let name = recipientName || workerName;
    if (!name) {
      if (type === 'technician') {
        const technicians = readData('technicians');
        const technician = technicians.find(t => t._id === id);
        name = technician ? technician.name : null;
      } else {
        const workers = readData('workers');
        const worker = workers.find(w => w._id === id);
        name = worker ? worker.name : null;
      }
    }
    
    const salary = {
      _id: generateId(),
      recipientId: id,
      recipientType: type,
      recipientName: name,
      // Legacy fields for backward compatibility
      workerId: type === 'worker' ? id : undefined,
      workerName: type === 'worker' ? name : undefined,
      month,
      baseSalary: base,
      bonus: b,
      deductions: d,
      totalSalary: total,
      paymentStatus: paymentStatus || 'Unpaid',
      collegeId,
    };
    salaries.push(salary);
    writeData('salaries', salaries);
    res.status(201).json(salary);
  } catch (err) {
    console.error('createSalary error:', err);
    res.status(500).json({ message: 'Server error' });
  }
}

module.exports = { getSalaries, getWorkerSalaries, getMySalaries, createSalary, updateSalary };
