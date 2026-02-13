const { readData } = require('../utils/fileHandler');

function getAdminStats(req, res) {
  try {
    const { collegeId } = req.query;
    if (!collegeId) return res.status(400).json({ message: 'collegeId is required' });

    const workers = readData('workers').filter(w => w.collegeId === collegeId);
    const events = readData('events').filter(e => e.collegeId === collegeId);
    const complaints = readData('complaints').filter(c => c.collegeId === collegeId);
    const salaries = readData('salaries').filter(s => s.collegeId === collegeId);
    const departments = readData('departments').filter(d => d.collegeId === collegeId);

    const DEPARTMENTS = [
      'Cleaning', 'Electrical', 'Plumbing', 'Infrastructure',
      'Security', 'Washroom Maintenance', 'HVAC'
    ];

    const workersByDepartment = {};
    DEPARTMENTS.forEach(d => { workersByDepartment[d] = workers.filter(w => w.department === d).length; });

    const complaintsByStatus = {
      'Submitted': 0, 'Under Review': 0, 'Approved & Prioritized': 0,
      'Assigned': 0, 'In Progress': 0, 'Resolved': 0
    };
    complaints.forEach(c => {
      if (complaintsByStatus[c.status] !== undefined) complaintsByStatus[c.status]++;
    });

    const totalSalaryPayout = salaries
      .filter(s => s.paymentStatus === 'Paid')
      .reduce((sum, s) => sum + s.totalSalary, 0);

    let totalVacancies = 0;
    DEPARTMENTS.forEach(name => {
      const dept = departments.find(d => d.name === name);
      const currentCount = workers.filter(w => w.department === name).length;
      const required = dept ? dept.requiredCount : 10;
      totalVacancies += Math.max(0, required - currentCount);
    });

    const monthlyExpenses = [];
    const paidByMonth = {};
    salaries.filter(s => s.paymentStatus === 'Paid').forEach(s => {
      const m = s.month;
      paidByMonth[m] = (paidByMonth[m] || 0) + s.totalSalary;
    });
    Object.entries(paidByMonth)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-6)
      .forEach(([month, amount]) => {
        const d = new Date(month + '-01');
        monthlyExpenses.push({
          month: d.toLocaleString('default', { month: 'short' }),
          amount,
        });
      });

    const workerPerformance = DEPARTMENTS.map(name => {
      const deptWorkers = workers.filter(w => w.department === name);
      const avg = deptWorkers.length
        ? deptWorkers.reduce((sum, w) => sum + (w.performanceRating || 0), 0) / deptWorkers.length
        : 3.5;
      return { name: name.replace(' Maintenance', ''), rating: Math.round(avg * 10) / 10 };
    });

    const stats = {
      totalWorkers: workers.length,
      availableWorkers: workers.filter(w => w.availabilityStatus === 'Available').length,
      activeEvents: events.filter(e => e.status === 'Ongoing' || e.status === 'Upcoming').length,
      totalSalaryPayout,
      totalVacancies,
      totalComplaints: complaints.length,
      complaintsByStatus,
      workersByDepartment,
      monthlyExpenses: monthlyExpenses.length > 0 ? monthlyExpenses : [
        { month: 'Jan', amount: 0 }, { month: 'Feb', amount: 0 },
      ],
      workerPerformance,
    };
    res.json(stats);
  } catch (err) {
    console.error('getAdminStats error:', err);
    res.status(500).json({ message: 'Server error' });
  }
}

module.exports = { getAdminStats };
