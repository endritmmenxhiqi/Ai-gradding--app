const Assignment = require('../models/assignment');
const Submission = require('../models/submission');
const Subject = require('../models/subject');
const Enrollment = require('../models/enrollment');
const evaluateWithAI = require('../services/aiGrading');

// Merr lëndët ku studenti është i regjistruar
exports.getSubjects = async (req, res) => {
  try {
    const studentId = req.user.id;
    const enrollments = await Enrollment.find({ student: studentId }).populate('subject');
    const subjects = enrollments.map(e => e.subject);
    res.json(subjects);
  } catch (err) {
    res.status(500).json({ error: 'Gabim gjatë ngarkimit të lëndëve' });
  }
};

// Merr detyrat për një lëndë specifike dhe verifiko dorëzimet
exports.getAssignments = async (req, res) => {
  try {
    const subjectId = req.params.subjectId;
    const assignments = await Assignment.find({ subject: subjectId });
    const submissions = await Submission.find({ student: req.user.id, subject: subjectId });

    const response = assignments.map(a => {
      const submitted = submissions.find(s => s.assignment.toString() === a._id.toString());
      return {
        assignment: a,
        submitted: !!submitted,
        grade: submitted?.manualGrade ?? submitted?.grade ?? null,
        complaint: submitted?.complaint ?? null,
        aiComment: submitted?.aiComment ?? null,
        _id: submitted?._id
      };
    });

    res.json(response);
  } catch (err) {
    res.status(500).json({ error: 'Gabim gjatë ngarkimit të detyrave' });
  }
};

// Dorëzimi i një detyre
exports.submitAssignment = async (req, res) => {
  try {
    const { assignmentId, subjectId } = req.body;
    const text = req.body.text || null;
    const student = req.user.id;

    const existing = await Submission.findOne({ student, assignment: assignmentId });
    if (existing) return res.status(400).json({ error: 'Kjo detyrë është dorëzuar tashmë' });

    const assignment = await Assignment.findById(assignmentId);
    const criteria = assignment?.criteria || '';
    const aiEvaluation = await evaluateWithAI(text, criteria);

    const submission = new Submission({
      student,
      assignment: assignmentId,
      subject: subjectId,
      text,
      grade: aiEvaluation.grade,
      aiComment: aiEvaluation.comment
    });

    await submission.save();
    res.status(201).json({ message: 'Detyra u dorëzua me sukses' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gabim gjatë dorëzimit të detyrës' });
  }
};

// Dërgimi i një ankese për notën
exports.submitComplaint = async (req, res) => {
  try {
    const { complaint } = req.body;
    const submissionId = req.params.submissionId;

    await Submission.findByIdAndUpdate(submissionId, { complaint });
    res.json({ message: 'Ankesa u regjistrua' });
  } catch (err) {
    res.status(500).json({ error: 'Gabim gjatë dërgimit të ankesës' });
  }
};

// ✅ Merr notat e studentit për një lëndë specifike me mesatare
exports.getStudentGrades = async (req, res) => {
  try {
    const studentId = req.user.id;
    const subjectId = req.params.subjectId;

    const submissions = await Submission.find({ student: studentId, subject: subjectId }).populate('assignment');

    const result = submissions.map(s => {
      const grade = s.manualGrade ?? s.grade;
      return {
        assignmentTitle: s.assignment.title,
        grade,
        aiComment: s.aiComment
      };
    });

    // Llogarit mesataren (ku nota 5 = 0)
    const numericGrades = result
      .map(r => (r.grade === 5 ? 0 : r.grade))
      .filter(g => typeof g === 'number');

    const average = numericGrades.length
      ? (numericGrades.reduce((a, b) => a + b, 0) / numericGrades.length).toFixed(2)
      : null;

    res.json({
      grades: result,
      average
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gabim gjatë ngarkimit të notave' });
  }
};
