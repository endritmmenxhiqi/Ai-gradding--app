const Assignment = require('../models/assignment');
const Submission = require('../models/submission');
const Subject = require('../models/subject');
const Enrollment = require('../models/enrollment');
const User = require('../models/user');
const evaluateWithAI = require('../services/aiGrading');

// Merr lëndët e profesorit
exports.getSubjectsByProfessor = async (req, res) => {
  try {
    const professorId = req.user.id;
    const subjects = await Subject.find({ professor: professorId });
    res.json(subjects);
  } catch (err) {
    res.status(500).json({ error: 'Gabim gjatë marrjes së lëndëve' });
  }
};

// Krijo detyrë
exports.createAssignment = async (req, res) => {
  try {
    const { title, description, deadline, criteria, subjectId } = req.body;
    const assignment = new Assignment({ title, description, deadline, criteria, subject: subjectId });
    await assignment.save();
    res.status(201).json({ message: 'Detyra u krijua me sukses' });
  } catch (err) {
    res.status(500).json({ error: 'Gabim gjatë krijimit të detyrës' });
  }
};

// Merr detyrat për një lëndë
exports.getAssignmentsBySubject = async (req, res) => {
  try {
    const { subjectId } = req.params;
    const assignments = await Assignment.find({ subject: subjectId });
    res.json(assignments);
  } catch (err) {
    res.status(500).json({ error: 'Gabim gjatë ngarkimit të detyrave' });
  }
};

// Fshi një detyrë
exports.deleteAssignment = async (req, res) => {
  try {
    await Assignment.findByIdAndDelete(req.params.id);
    res.json({ message: 'Detyra u fshi me sukses' });
  } catch (err) {
    res.status(500).json({ error: 'Gabim gjatë fshirjes së detyrës' });
  }
};

// Merr dorëzimet për një lëndë
exports.getSubmissionsBySubject = async (req, res) => {
  try {
    const { subjectId } = req.params;
    const submissions = await Submission.find({ subject: subjectId })
      .populate('student', 'name')
      .populate('assignment', 'title');
    res.json(submissions.map(s => ({
      ...s._doc,
      text: s.text
    })));
  } catch (err) {
    res.status(500).json({ error: 'Gabim gjatë marrjes së dorëzimeve' });
  }
};

// Rivlerëso me AI
exports.regradeSubmission = async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.submissionId).populate('assignment');
    if (!submission) return res.status(404).json({ error: 'Dorëzimi nuk u gjet' });

    const criteria = submission.assignment?.criteria || '';
    const text = submission.text || '';

    const result = await evaluateWithAI(text, criteria);
    const newGrade = result.grade;
    const comment = result.comment;

    submission.grade = newGrade;
    submission.aiComment = comment;
    await submission.save();

    res.json({ message: `Rivlerësimi u bë me sukses (nota: ${newGrade})`, grade: newGrade, comment });
  } catch (err) {
    res.status(500).json({ error: 'Gabim gjatë rivlerësimit' });
  }
};

// Vendos nota manuale
exports.setManualGrade = async (req, res) => {
  try {
    const { grade } = req.body;
    if (!grade || isNaN(grade) || grade < 5 || grade > 10) {
      return res.status(400).json({ error: 'Nota duhet të jetë mes 5 dhe 10' });
    }

    const submission = await Submission.findById(req.params.submissionId);
    if (!submission) return res.status(404).json({ error: 'Dorëzimi nuk u gjet' });

    submission.manualGrade = grade;
    submission.grade = grade;
    await submission.save();

    res.json({ message: 'Nota u vendos me sukses' });
  } catch (err) {
    res.status(500).json({ error: 'Gabim gjatë vendosjes së notës' });
  }
};

// Gjenero raport me komente të AI dhe trajtim të notës 5 si 0
exports.generateReport = async (req, res) => {
  try {
    const { subjectId } = req.params;
    const submissions = await Submission.find({ subject: subjectId })
      .populate('student', 'name')
      .populate('assignment', 'title');

    if (!submissions || submissions.length === 0) {
      return res.json([]);
    }

    const raporti = {};

    submissions.forEach(sub => {
      const sid = sub.student._id.toString();
      let nota = sub.manualGrade ?? sub.grade ?? 0;
      nota = nota === 5 ? 0 : nota;

      if (!raporti[sid]) {
        raporti[sid] = {
          student: sub.student,
          grades: [],
          total: 0,
          count: 0
        };
      }

      raporti[sid].grades.push({
        assignmentTitle: sub.assignment?.title || 'Pa titull',
        grade: nota,
        feedback: sub.aiComment || '-'
      });

      raporti[sid].total += nota;
      raporti[sid].count += 1;
    });

    const result = Object.values(raporti).map(s => ({
      student: s.student,
      grades: s.grades,
      average: s.count ? (s.total / s.count).toFixed(2) : null
    }));

    res.json(result);
  } catch (err) {
    console.error("❌ Gabim në raport:", err);
    res.status(500).json({ error: 'Gabim gjatë gjenerimit të raportit' });
  }
};

// Regjistro student
exports.enrollStudent = async (req, res) => {
  try {
    const { subjectId, studentId } = req.body;
    const student = await User.findOne({ _id: studentId, role: 'student' });
    if (!student) return res.status(404).json({ error: 'Studenti nuk u gjet' });

    const exists = await Enrollment.findOne({ student: studentId, subject: subjectId });
    if (exists) return res.status(400).json({ error: 'Studenti është i regjistruar tashmë' });

    const enrollment = new Enrollment({ student: studentId, subject: subjectId });
    await enrollment.save();
    res.json({ message: '✅ Studenti u regjistrua me sukses' });
  } catch (err) {
    res.status(500).json({ error: 'Gabim gjatë regjistrimit' });
  }
};

// Fshi student nga lënda
exports.unenrollStudent = async (req, res) => {
  try {
    const { subjectId, studentId } = req.body;
    const deleted = await Enrollment.findOneAndDelete({ student: studentId, subject: subjectId });
    if (!deleted) return res.status(404).json({ error: 'Studenti nuk ishte i regjistruar' });

    res.json({ message: '❌ Studenti u fshi nga lënda' });
  } catch (err) {
    res.status(500).json({ error: 'Gabim gjatë fshirjes së regjistrimit' });
  }
};

// Merr studentët e regjistruar
exports.getEnrolledStudents = async (req, res) => {
  try {
    const { subjectId } = req.params;
    const enrollments = await Enrollment.find({ subject: subjectId }).populate('student', 'name');
    const students = enrollments.map(e => ({
      _id: e.student._id,
      name: e.student.name
    }));
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: 'Gabim gjatë ngarkimit të studentëve' });
  }
};

// Merr përgjigjet për një detyrë
exports.getStudentAnswersForAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ error: 'Detyra nuk u gjet' });
    }

    const submissions = await Submission.find({ assignment: assignmentId })
      .populate('student', 'name')
      .populate('assignment', 'title');

    if (submissions.length === 0) {
      return res.status(404).json({ error: 'Nuk ka përgjigje të studentëve për këtë detyrë' });
    }

    res.json(submissions.map(submission => ({
      studentName: submission.student.name,
      answer: submission.text,
      grade: submission.grade,
      submittedAt: submission.submittedAt
    })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gabim gjatë marrjes së dorëzimeve' });
  }
};

// Raport për lëndë me nota mesatare (ku 5 => 0)
exports.generateSubjectReport = async (req, res) => {
  try {
    const { subjectId } = req.params;

    const submissions = await Submission.find({ subject: subjectId }).populate('student');

    const studentGrades = {};

    submissions.forEach(sub => {
      const studentId = sub.student._id.toString();
      if (!studentGrades[studentId]) {
        studentGrades[studentId] = {
          name: sub.student.name,
          grades: []
        };
      }

      const nota = sub.manualGrade ?? sub.grade;
      studentGrades[studentId].grades.push(nota === 5 ? 0 : nota || 0);
    });

    const students = Object.values(studentGrades).map(s => ({
      name: s.name,
      averageGrade: (s.grades.reduce((a, b) => a + b, 0) / s.grades.length).toFixed(2)
    }));

    const subject = await Subject.findById(subjectId);
    res.json({ subjectName: subject.name, students });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gabim gjatë gjenerimit të raportit për lëndën' });
  }
};
