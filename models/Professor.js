const mongoose = require('mongoose');

const professorSchema = new mongoose.Schema({
  department: {
    type: String,
  },
  profile: {
    type: String,
  },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  subjects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Subject' }],
});

module.exports = mongoose.model('Professor', professorSchema);
