const bcrypt = require('bcrypt');
const { readData, writeData, generateId } = require('../utils/fileHandler');

// Script to create user accounts for technicians
// Usage: node scripts/createTechnicianUsers.js <collegeId>

const collegeId = process.argv[2] || '4';

async function createTechnicianUsers() {
  const technicians = readData('technicians').filter(t => t.collegeId === collegeId);
  const users = readData('users');
  
  let created = 0;
  let updated = 0;

  for (const tech of technicians) {
    // Check if user already exists for this technician
    let user = users.find(u => u.email && u.email.includes(tech.name.toLowerCase().replace(/\s/g, '')));
    
    if (!user) {
      // Create email from technician name
      const emailName = tech.name.toLowerCase().replace(/\s/g, '');
      const email = `${emailName}@technician.local`;
      const pin = '1234'; // Default PIN
      const hashedPin = await bcrypt.hash(pin, 10);
      
      const userId = generateId();
      
      user = {
        _id: userId,
        fullName: tech.name,
        email: email,
        pin: hashedPin,
        role: 'technician',
        collegeId: collegeId,
      };
      
      users.push(user);
      created++;
      
      // Link technician to user
      const techIndex = technicians.findIndex(t => t._id === tech._id);
      if (techIndex !== -1) {
        technicians[techIndex].userId = userId;
      }
      
      console.log(`✓ Created user for technician: ${tech.name} (${email}) - PIN: ${pin}`);
    } else {
      // Update technician with existing user ID
      const techIndex = technicians.findIndex(t => t._id === tech._id);
      if (techIndex !== -1 && !technicians[techIndex].userId) {
        technicians[techIndex].userId = user._id;
        updated++;
        console.log(`✓ Linked existing user to technician: ${tech.name}`);
      }
    }
  }

  writeData('users', users);
  writeData('technicians', technicians);

  console.log('\n=== Summary ===');
  console.log(`College ID: ${collegeId}`);
  console.log(`Users Created: ${created}`);
  console.log(`Technicians Linked: ${updated}`);
  console.log(`Total Technician Users: ${users.filter(u => u.role === 'technician' && u.collegeId === collegeId).length}`);
  console.log('\nTechnicians can login with:');
  console.log('Email: <technicianname>@technician.local');
  console.log('PIN: 1234');
  console.log('Role: technician');
}

createTechnicianUsers().catch(console.error);
