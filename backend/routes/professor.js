// backend/routes/professor.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  getSubjectsByProfessor,
  createAssignment,
  getAssignmentsBySubject,
  deleteAssignment,
  getSubmissionsBySubject,
  regradeSubmission,
  setManualGrade,
  generateReport,
  generateSubjectReport, // ✅ Funksioni i ri
  enrollStudent,
  unenrollStudent,
  getEnrolledStudents,
  getStudentAnswersForAssignment
} = require('../controllers/professorController');

// Lëndët e profesorit
router.get('/subjects', auth, getSubjectsByProfessor);

// Krijimi dhe menaxhimi i detyrave
router.post('/assignments', auth, createAssignment);
router.get('/assignments/:subjectId', auth, getAssignmentsBySubject);
router.delete('/assignments/:id', auth, deleteAssignment);

// Dorëzimet me filtrim opsional sipas detyrës
router.get('/submissions/:subjectId', auth, getSubmissionsBySubject);

// Vlerësime
router.put('/grade/:submissionId', auth, regradeSubmission);           // Rivlerësim me AI
router.put('/grade/manual/:submissionId', auth, setManualGrade);      // Nota manuale nga profesori

// Raportet për notat
router.get('/report/:subjectId', auth, generateReport);               // Raport i detajuar për çdo student
router.get('/report/subject/:subjectId', auth, generateSubjectReport); // ✅ Raport mesatar për lëndë

// Menaxhimi i studentëve në lëndë
router.post('/enroll', auth, enrollStudent);
router.delete('/enroll', auth, unenrollStudent);
router.get('/enrollments/:subjectId', auth, getEnrolledStudents);

// Përgjigjet e studentëve për një detyrë
router.get('/assignment/submissions/:assignmentId', auth, getStudentAnswersForAssignment);

module.exports = router;
