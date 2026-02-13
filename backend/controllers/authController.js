const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { readData, writeData, generateId } = require('../utils/fileHandler');
const { JWT_SECRET } = require('../middleware/auth');

async function login(req, res) {
  try {
    const { fullName, pin, email, role, collegeId } = req.body;
    if (!fullName || !pin || !email || !role || !collegeId) {
      return res.status(400).json({ message: 'fullName, pin, email, role, and collegeId are required' });
    }

    const users = readData('users');
    let user = users.find(u => u.email === email && u.collegeId === collegeId);

    if (!user) {
      // New user - create account
      const hashedPin = await bcrypt.hash(pin, 10);
      user = {
        _id: generateId(),
        fullName,
        email,
        pin: hashedPin,
        role,
        collegeId,
      };
      users.push(user);
      writeData('users', users);
    } else {
      // Existing user - verify PIN
      const match = await bcrypt.compare(pin, user.pin);
      if (!match) {
        return res.status(401).json({ 
          message: 'Invalid PIN. If you forgot your PIN, please contact support or delete your account to re-register.' 
        });
      }
      // Update user info if changed (name, role)
      if (user.fullName !== fullName || user.role !== role) {
        user.fullName = fullName;
        user.role = role;
        const userIndex = users.findIndex(u => u._id === user._id);
        if (userIndex !== -1) {
          users[userIndex] = user;
          writeData('users', users);
        }
      }
    }

    const { pin: _, ...userWithoutPin } = user;
    const token = jwt.sign(
      { userId: user._id, role: user.role, collegeId: user.collegeId },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.json({ user: userWithoutPin, token });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
}

module.exports = { login };
