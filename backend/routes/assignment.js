// routes/assignment.js
const express = require('express');
const router = express.Router();
const Assignment = require('../models/assignment');

router.post('/', async (req, res) => {
  try {
    const assignment = new Assignment(req.body);
    await assignment.save();
    res.status(201).json(assignment);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/subject/:subjectId', async (req, res) => {
  try {
    const assignments = await Assignment.find({ subject: req.params.subjectId });
    res.json(assignments);
  } catch (error) {
    res.status(500).json({ error: 'Gabim serveri' });
  }
});

module.exports = router;

// routes/submission.js
const express = require('express');
const routes = express.Router();
const Submission = require('../models/submission');

router.get('/assignment/:assignmentId', async (req, res) => {
  try {
    const submissions = await Submission.find({ assignment: req.params.assignmentId })
      .populate('student', 'firstName lastName email')
      .populate('assignment', 'title');
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ error: 'Gabim serveri' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const submission = await Submission.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    res.json(submission);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;