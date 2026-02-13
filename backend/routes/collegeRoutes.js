const express = require('express');
const { getColleges, getCollege } = require('../controllers/collegeController');

const router = express.Router();
router.get('/', getColleges);
router.get('/:id', getCollege);

module.exports = router;
