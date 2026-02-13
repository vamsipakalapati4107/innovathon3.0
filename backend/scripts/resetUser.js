const { readData, writeData } = require('../utils/fileHandler');

// Script to reset/delete a user by email and collegeId
// Usage: node scripts/resetUser.js <email> <collegeId>

const email = process.argv[2];
const collegeId = process.argv[3];

if (!email || !collegeId) {
  console.log('Usage: node scripts/resetUser.js <email> <collegeId>');
  console.log('Example: node scripts/resetUser.js user@college.edu 4');
  process.exit(1);
}

const users = readData('users');
const initialCount = users.length;
const filtered = users.filter(u => !(u.email === email && u.collegeId === collegeId));

if (filtered.length === initialCount) {
  console.log(`User with email ${email} and collegeId ${collegeId} not found.`);
} else {
  writeData('users', filtered);
  console.log(`User ${email} (collegeId: ${collegeId}) has been deleted.`);
  console.log(`You can now register again with a new PIN.`);
}
