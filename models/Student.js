const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  studentIdNo: { type: String },
  department: {
    type: String,
  },
  profile: {
    type: String,
  },
  grade: {
    type: String,
  },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  subjects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Subject' }],
});

module.exports = mongoose.model('Student', studentSchema);
