const { readData, writeData, generateId } = require('../utils/fileHandler');

// Script to create sample technicians for each department
// Usage: node scripts/createSampleTechnicians.js <collegeId>

const collegeId = process.argv[2] || '4';

const DEPARTMENTS = [
  'Cleaning',
  'Electrical',
  'Plumbing',
  'Infrastructure',
  'Security',
  'Washroom Maintenance',
  'HVAC'
];

const sampleTechnicians = [
  // Cleaning Department
  {
    name: 'Rajesh Kumar',
    phone: '9876543210',
    department: 'Cleaning',
    role: 'Senior Cleaner',
    experience: 8,
    availabilityStatus: 'Available',
  },
  {
    name: 'Priya Sharma',
    phone: '9876543211',
    department: 'Cleaning',
    role: 'Cleaner',
    experience: 3,
    availabilityStatus: 'Available',
  },
  {
    name: 'Amit Patel',
    phone: '9876543212',
    department: 'Cleaning',
    role: 'Cleaner',
    experience: 5,
    availabilityStatus: 'Assigned',
  },

  // Electrical Department
  {
    name: 'Vikram Singh',
    phone: '9876543220',
    department: 'Electrical',
    role: 'Senior Electrician',
    experience: 12,
    availabilityStatus: 'Available',
  },
  {
    name: 'Suresh Reddy',
    phone: '9876543221',
    department: 'Electrical',
    role: 'Electrician',
    experience: 6,
    availabilityStatus: 'Available',
  },
  {
    name: 'Ramesh Iyer',
    phone: '9876543222',
    department: 'Electrical',
    role: 'Junior Electrician',
    experience: 2,
    availabilityStatus: 'Assigned',
  },

  // Plumbing Department
  {
    name: 'Mohammed Ali',
    phone: '9876543230',
    department: 'Plumbing',
    role: 'Senior Plumber',
    experience: 10,
    availabilityStatus: 'Available',
  },
  {
    name: 'Kiran Desai',
    phone: '9876543231',
    department: 'Plumbing',
    role: 'Plumber',
    experience: 4,
    availabilityStatus: 'Available',
  },
  {
    name: 'Anil Mehta',
    phone: '9876543232',
    department: 'Plumbing',
    role: 'Plumber',
    experience: 7,
    availabilityStatus: 'Assigned',
  },

  // Infrastructure Department
  {
    name: 'Deepak Joshi',
    phone: '9876543240',
    department: 'Infrastructure',
    role: 'Infrastructure Manager',
    experience: 15,
    availabilityStatus: 'Available',
  },
  {
    name: 'Ravi Verma',
    phone: '9876543241',
    department: 'Infrastructure',
    role: 'Infrastructure Technician',
    experience: 8,
    availabilityStatus: 'Available',
  },
  {
    name: 'Sunil Nair',
    phone: '9876543242',
    department: 'Infrastructure',
    role: 'Infrastructure Assistant',
    experience: 4,
    availabilityStatus: 'Assigned',
  },

  // Security Department
  {
    name: 'Jagdish Kumar',
    phone: '9876543250',
    department: 'Security',
    role: 'Security Supervisor',
    experience: 10,
    availabilityStatus: 'Available',
  },
  {
    name: 'Manoj Tiwari',
    phone: '9876543251',
    department: 'Security',
    role: 'Security Guard',
    experience: 5,
    availabilityStatus: 'Available',
  },
  {
    name: 'Sandeep Yadav',
    phone: '9876543252',
    department: 'Security',
    role: 'Security Guard',
    experience: 3,
    availabilityStatus: 'Assigned',
  },

  // Washroom Maintenance Department
  {
    name: 'Lakshmi Devi',
    phone: '9876543260',
    department: 'Washroom Maintenance',
    role: 'Maintenance Supervisor',
    experience: 9,
    availabilityStatus: 'Available',
  },
  {
    name: 'Geeta Kumari',
    phone: '9876543261',
    department: 'Washroom Maintenance',
    role: 'Maintenance Worker',
    experience: 4,
    availabilityStatus: 'Available',
  },
  {
    name: 'Radha Sharma',
    phone: '9876543262',
    department: 'Washroom Maintenance',
    role: 'Maintenance Worker',
    experience: 6,
    availabilityStatus: 'Assigned',
  },

  // HVAC Department
  {
    name: 'Naveen Kumar',
    phone: '9876543270',
    department: 'HVAC',
    role: 'HVAC Specialist',
    experience: 11,
    availabilityStatus: 'Available',
  },
  {
    name: 'Pradeep Rao',
    phone: '9876543271',
    department: 'HVAC',
    role: 'HVAC Technician',
    experience: 7,
    availabilityStatus: 'Available',
  },
  {
    name: 'Harish Gowda',
    phone: '9876543272',
    department: 'HVAC',
    role: 'HVAC Assistant',
    experience: 3,
    availabilityStatus: 'Assigned',
  },
];

function createSampleTechnicians() {
  const workers = readData('workers');
  const joiningDate = new Date().toISOString().slice(0, 10);
  
  let created = 0;
  let skipped = 0;

  sampleTechnicians.forEach((tech) => {
    // Check if technician already exists (by name and department)
    const exists = workers.some(
      w => w.name === tech.name && 
           w.department === tech.department && 
           w.collegeId === collegeId
    );

    if (!exists) {
      const worker = {
        _id: generateId(),
        name: tech.name,
        phone: tech.phone,
        department: tech.department,
        role: tech.role,
        experience: tech.experience,
        joiningDate: joiningDate,
        availabilityStatus: tech.availabilityStatus,
        complaintsAssigned: [],
        eventsAssigned: [],
        performanceRating: Math.floor(Math.random() * 5) + 1, // Random rating 1-5
        collegeId: collegeId,
      };
      workers.push(worker);
      created++;
      console.log(`✓ Created: ${tech.name} - ${tech.department}`);
    } else {
      skipped++;
      console.log(`⊘ Skipped: ${tech.name} - ${tech.department} (already exists)`);
    }
  });

  writeData('workers', workers);
  
  console.log('\n=== Summary ===');
  console.log(`College ID: ${collegeId}`);
  console.log(`Created: ${created} technicians`);
  console.log(`Skipped: ${skipped} technicians (already exist)`);
  console.log(`Total technicians: ${workers.filter(w => w.collegeId === collegeId).length}`);
  
  // Show breakdown by department
  console.log('\n=== By Department ===');
  DEPARTMENTS.forEach(dept => {
    const count = workers.filter(w => w.department === dept && w.collegeId === collegeId).length;
    console.log(`${dept}: ${count} technician(s)`);
  });
}

createSampleTechnicians();
