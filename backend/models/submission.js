const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assignment',
    required: true
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true
  },
  text: {
    type: String
  },
  grade: {
    type: Number // nota nga AI
  },
  manualGrade: {
    type: Number // nota e vendosur nga profesori nëse ka ndodhur rivlerësim
  },
  complaint: {
    type: String
  },
  aiComment: {
    type: String // koment i AI në momentin e vlerësimit
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Submission', submissionSchema);
