const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    trim: true
  },
  professor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Kontrollo unike kombinim lëndë-profesor
subjectSchema.index({ name: 1, professor: 1 }, { unique: true });

module.exports = mongoose.model('Subject', subjectSchema);