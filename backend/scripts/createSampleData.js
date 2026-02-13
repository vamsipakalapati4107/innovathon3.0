const { readData, writeData, generateId } = require('../utils/fileHandler');

// Script to create sample workers (internal) and technicians (external)
// Usage: node scripts/createSampleData.js <collegeId>

const collegeId = process.argv[2] || '4';

// Sample Workers (Internal College Staff)
const sampleWorkers = [
  {
    name: 'Ramesh Kumar',
    phone: '9876543001',
    department: 'Cleaning',
    role: 'Housekeeping Staff',
    experience: 5,
    employeeId: 'EMP001',
  },
  {
    name: 'Sunita Devi',
    phone: '9876543002',
    department: 'Cleaning',
    role: 'Housekeeping Staff',
    experience: 3,
    employeeId: 'EMP002',
  },
  {
    name: 'Mahesh Singh',
    phone: '9876543003',
    department: 'Security',
    role: 'Security Guard',
    experience: 8,
    employeeId: 'EMP003',
  },
  {
    name: 'Rajesh Patel',
    phone: '9876543004',
    department: 'Security',
    role: 'Security Guard',
    experience: 4,
    employeeId: 'EMP004',
  },
  {
    name: 'Lakshmi Nair',
    phone: '9876543005',
    department: 'Washroom Maintenance',
    role: 'Maintenance Staff',
    experience: 6,
    employeeId: 'EMP005',
  },
  {
    name: 'Vijay Reddy',
    phone: '9876543006',
    department: 'Infrastructure',
    role: 'Maintenance Worker',
    experience: 7,
    employeeId: 'EMP006',
  },
];

// Sample Technicians (External Contractors)
const sampleTechnicians = [
  {
    name: 'Vikram Singh',
    phone: '9876543220',
    department: 'Electrical',
    role: 'Senior Electrician',
    experience: 12,
    companyName: 'PowerTech Solutions',
  },
  {
    name: 'Suresh Reddy',
    phone: '9876543221',
    department: 'Electrical',
    role: 'Electrician',
    experience: 6,
    companyName: 'PowerTech Solutions',
  },
  {
    name: 'Mohammed Ali',
    phone: '9876543230',
    department: 'Plumbing',
    role: 'Senior Plumber',
    experience: 10,
    companyName: 'AquaFlow Services',
  },
  {
    name: 'Kiran Desai',
    phone: '9876543231',
    department: 'Plumbing',
    role: 'Plumber',
    experience: 4,
    companyName: 'AquaFlow Services',
  },
  {
    name: 'Deepak Joshi',
    phone: '9876543240',
    department: 'Infrastructure',
    role: 'Infrastructure Specialist',
    experience: 15,
    companyName: 'BuildRight Contractors',
  },
  {
    name: 'Ravi Verma',
    phone: '9876543241',
    department: 'Infrastructure',
    role: 'Infrastructure Technician',
    experience: 8,
    companyName: 'BuildRight Contractors',
  },
  {
    name: 'Naveen Kumar',
    phone: '9876543270',
    department: 'HVAC',
    role: 'HVAC Specialist',
    experience: 11,
    companyName: 'CoolAir Systems',
  },
  {
    name: 'Pradeep Rao',
    phone: '9876543271',
    department: 'HVAC',
    role: 'HVAC Technician',
    experience: 7,
    companyName: 'CoolAir Systems',
  },
  {
    name: 'Rajesh Kumar',
    phone: '9876543210',
    department: 'Cleaning',
    role: 'Deep Cleaning Specialist',
    experience: 8,
    companyName: 'CleanPro Services',
  },
  {
    name: 'Lakshmi Devi',
    phone: '9876543260',
    department: 'Washroom Maintenance',
    role: 'Sanitation Specialist',
    experience: 9,
    companyName: 'HygieneCare Solutions',
  },
];

function createSampleData() {
  const joiningDate = new Date().toISOString().slice(0, 10);
  
  // Create Workers (Internal)
  const workers = readData('workers');
  let workersCreated = 0;
  
  sampleWorkers.forEach((worker) => {
    const exists = workers.some(
      w => w.name === worker.name && 
           w.department === worker.department && 
           w.collegeId === collegeId
    );

    if (!exists) {
      workers.push({
        _id: generateId(),
        name: worker.name,
        phone: worker.phone,
        department: worker.department,
        role: worker.role,
        experience: worker.experience,
        joiningDate: joiningDate,
        availabilityStatus: 'Available',
        complaintsAssigned: [],
        eventsAssigned: [],
        performanceRating: Math.floor(Math.random() * 2) + 4, // 4-5
        collegeId: collegeId,
        employeeId: worker.employeeId,
        isInternal: true,
      });
      workersCreated++;
      console.log(`✓ Created Worker: ${worker.name} - ${worker.department}`);
    }
  });

  writeData('workers', workers);

  // Create Technicians (External)
  const technicians = readData('technicians');
  let techniciansCreated = 0;
  
  sampleTechnicians.forEach((tech) => {
    const exists = technicians.some(
      t => t.name === tech.name && 
           t.department === tech.department && 
           t.collegeId === collegeId
    );

    if (!exists) {
      technicians.push({
        _id: generateId(),
        name: tech.name,
        phone: tech.phone,
        department: tech.department,
        role: tech.role,
        experience: tech.experience,
        joiningDate: joiningDate,
        availabilityStatus: 'Available',
        complaintsAssigned: [],
        eventsAssigned: [],
        performanceRating: Math.floor(Math.random() * 2) + 4, // 4-5
        collegeId: collegeId,
        companyName: tech.companyName,
        isInternal: false,
        userId: null, // Will be linked when technician creates account
      });
      techniciansCreated++;
      console.log(`✓ Created Technician: ${tech.name} - ${tech.department} (${tech.companyName})`);
    }
  });

  writeData('technicians', technicians);

  console.log('\n=== Summary ===');
  console.log(`College ID: ${collegeId}`);
  console.log(`Workers Created: ${workersCreated}`);
  console.log(`Technicians Created: ${techniciansCreated}`);
  console.log(`Total Workers: ${workers.filter(w => w.collegeId === collegeId).length}`);
  console.log(`Total Technicians: ${technicians.filter(t => t.collegeId === collegeId).length}`);
}

createSampleData();
