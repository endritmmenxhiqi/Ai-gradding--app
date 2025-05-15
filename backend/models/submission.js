const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  assignment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assignment',
    required: true
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  files: [String], // Paths to uploaded files
  text: String,
  aiGrade: Number,
  aiReport: String,
  professorGrade: Number,
  professorComment: String,
  submittedAt: {
    type: Date,
    default: Date.now
  },
  contested: {
    type: Boolean,
    default: false
  }
});

module.exports = mongoose.model('Submission', submissionSchema);