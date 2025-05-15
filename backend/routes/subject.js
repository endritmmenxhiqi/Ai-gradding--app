const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Subject = require('../models/subject');

// Merr të gjithë profesorët
router.get('/professors', async (req, res) => {
  try {
    const professors = await User.find({ role: 'professor' }).select('firstName lastName');
    res.json(professors);
  } catch (error) {
    res.status(500).json({ msg: 'Gabim serveri' });
  }
});

// Shto lëndë të re
router.post('/add', async (req, res) => {
  const { professorId, subjectName } = req.body;

  try {
    // Validime
    if(!subjectName || !professorId) {
      return res.status(400).json({ msg: 'Plotëso të gjitha fushat' });
    }

    const professor = await User.findById(professorId);
    if(!professor || professor.role !== 'professor') {
      return res.status(404).json({ msg: 'Profesor nuk u gjet' });
    }

    // Kontrollo ekzistencën
    const existingSubject = await Subject.findOne({ 
      name: subjectName, 
      professor: professorId 
    });

    if(existingSubject) {
      return res.status(400).json({ msg: 'Kjo lëndë ekziston për këtë profesor' });
    }

    // Krijo lëndën
    const newSubject = new Subject({
      name: subjectName,
      professor: professorId
    });

    await newSubject.save();
    res.status(201).json({ msg: 'Lënda u shtua me sukses' });

  } catch (error) {
    res.status(500).json({ msg: 'Gabim serveri' });
  }
});
router.delete('/delete/:id', async (req, res) => {
  try {
    const subject = await Subject.findByIdAndDelete(req.params.id);
    
    if(!subject) {
      return res.status(404).json({ msg: 'Lënda nuk u gjet' });
    }
    
    res.json({ msg: 'Lënda u fshi me sukses' });
  } catch (error) {
    res.status(500).json({ msg: 'Gabim serveri' });
  }
});

// Shto këtë rrugë për marrjen e të gjitha lëndëve
router.get('/', async (req, res) => {
  try {
    const subjects = await Subject.find().populate('professor', 'firstName lastName');
    res.json(subjects);
  } catch (error) {
    res.status(500).json({ msg: 'Gabim serveri' });
  }
});
router.get('/students/search', async (req, res) => {
  const { query } = req.query;

  try {
    // Kërko studentin
    const student = await User.findOne({
      $or: [
        { email: query },
        { _id: query },
        { firstName: new RegExp(query, 'i') },
        { lastName: new RegExp(query, 'i') }
      ],
      role: 'student'
    });

    if (!student) return res.status(404).json({ error: 'Studenti nuk u gjet' });

    // Merr të gjitha dorëzimet e studentit
    const submissions = await Submission.find({ student: student._id })
      .populate('assignment', 'title description')
      .populate('student', 'firstName lastName');

    res.json({ student, submissions });
  } catch (error) {
    res.status(500).json({ error: 'Gabim serveri' });
  }
});

module.exports = router;