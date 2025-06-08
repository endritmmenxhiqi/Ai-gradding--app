// backend/routes/admin.js
const express = require('express');
const router = express.Router();
const {
  getAllProfessors,
  getAllStudents,
  createSubject,
  deleteSubject,
  getAllSubjects
} = require('../controllers/adminController');

router.get('/professors', getAllProfessors);
router.get('/students', getAllStudents);
router.post('/subjects', createSubject);
router.delete('/subjects/:id', deleteSubject);
router.get('/subjects', getAllSubjects);

module.exports = router;
