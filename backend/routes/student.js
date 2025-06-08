const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const multer = require('multer');
const upload = multer(); // për të lexuar FormData me ose pa file

const {
  getSubjects,
  getAssignments,
  submitAssignment,
  submitComplaint,
  getStudentGrades // ✅ Importimi i funksionit për notat
} = require('../controllers/studentController');

// ✅ Rruga për marrjen e lëndëve
router.get('/subjects', auth, getSubjects);

// ✅ Rruga për marrjen e detyrave për një lëndë specifike
router.get('/assignments/:subjectId', auth, getAssignments);

// ✅ Rruga për dorëzimin e detyrës (pa file)
router.post('/submit', auth, upload.none(), submitAssignment);

// ✅ Rruga për dërgimin e ankesës për një dorëzim specifik
router.put('/complaint/:submissionId', auth, submitComplaint);

// ✅ Rruga për marrjen e notave për një lëndë
router.get('/grades/:subjectId', auth, getStudentGrades);

module.exports = router;
