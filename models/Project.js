const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  mandatory: {
    type: Boolean,
    required: false,
  },
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: false,
  },
  mandatory: {
    type: Boolean,
    required: false,
  },
  numberOfAttendees: {
    type: String,
    required: true,
  },
  points: {
    type: String,
    required: true,
  },
  attendees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject' },
});

module.exports = mongoose.model('Project', projectSchema);
