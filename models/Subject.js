const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
  department: [
    {
      type: String,
      required: true,
    },
  ],
  profile: [
    {
      type: String,
      required: true,
    },
  ],
  grade: [
    {
      type: String,
      required: true,
    },
  ],
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
  professors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Professor' }],
});

module.exports = mongoose.model('Subject', subjectSchema);
