const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  deadline: { type: Date, required: true },
  criteria: { type: String, required: true },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true
  },
  // Fushtat e reja për përgjigjet e studentëve
  submissions: [
    {
      studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      answer: { type: String, required: true },
      grade: { type: Number, default: null }, // Nota do të vendoset më vonë nga profesori
      submittedAt: { type: Date, default: Date.now }
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('Assignment', assignmentSchema);
