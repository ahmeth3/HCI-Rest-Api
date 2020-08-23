const mongoose = require('mongoose');

const consultationSchema = new mongoose.Schema({
  typeOFDate: {
    type: String,
    required: true,
  },
  day: {
    type: String,
    required: false,
  },
  repeatEveryWeek: {
    type: Boolean,
    required: false,
  },
  date: {
    type: Date,
    required: false,
  },
  startTime: {
    type: String,
    required: true,
  },
  endTime: {
    type: String,
    required: true,
  },
  place: {
    type: String,
    required: true,
  },
  professor: { type: mongoose.Schema.Types.ObjectId, ref: 'Professor' },
  attendees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  valid: { type: Boolean },
});

module.exports = mongoose.model('Consultation', consultationSchema);
