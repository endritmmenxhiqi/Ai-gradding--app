// backend/controllers/adminController.js
const User = require('../models/user');
const Subject = require('../models/subject');

// Merr të gjithë profesorët
exports.getAllProfessors = async (req, res) => {
  try {
    const professors = await User.find({ role: 'professor' }).select('_id name');
    res.json(professors);
  } catch (err) {
    res.status(500).json({ error: 'Gabim gjatë marrjes së profesorëve' });
  }
};

// Merr të gjithë studentët
exports.getAllStudents = async (req, res) => {
  try {
    const students = await User.find({ role: 'student' }).select('_id name');
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: 'Gabim gjatë marrjes së studentëve' });
  }
};

// Krijo një lëndë
exports.createSubject = async (req, res) => {
  try {
    const { name, professorId } = req.body;
    if (!name || !professorId) {
      return res.status(400).json({ error: 'Plotëso të gjitha fushat' });
    }

    const subject = new Subject({ name, professor: professorId });
    await subject.save();
    res.status(201).json({ message: 'Lënda u shtua me sukses' });
  } catch (err) {
    res.status(500).json({ error: 'Gabim gjatë shtimit të lëndës' });
  }
};

// Fshi një lëndë
exports.deleteSubject = async (req, res) => {
  try {
    const subjectId = req.params.id;
    await Subject.findByIdAndDelete(subjectId);
    res.json({ message: 'Lënda u fshi me sukses' });
  } catch (err) {
    res.status(500).json({ error: 'Gabim gjatë fshirjes së lëndës' });
  }
};

// Merr të gjitha lëndët (për adminin)
exports.getAllSubjects = async (req, res) => {
  try {
    const subjects = await Subject.find().populate('professor', 'name');
    res.json(subjects);
  } catch (err) {
    res.status(500).json({ error: 'Gabim gjatë ngarkimit të lëndëve' });
  }
};
