// models/assignment.js
const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  deadline: { type: Date, required: true },
  criteria: { type: String, required: true },
  subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Assignment', assignmentSchema);

// models/submission.js
const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  assignment: { type: mongoose.Schema.Types.ObjectId, ref: 'Assignment', required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  files: [String],
  text: String,
  aiGrade: Number,
  aiReport: String,
  professorGrade: Number,
  professorComment: String,
  submittedAt: { type: Date, default: Date.now },
  contested: { type: Boolean, default: false }
});

module.exports = mongoose.model('Submission', submissionSchema);