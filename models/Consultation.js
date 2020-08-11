const mongoose = require('mongoose');

const consultationSchema = new mongoose.Schema({
  place: {
    type: String,
    required: true,
  },
  startTime: {
    type: String,
    required: true,
  },
  endTime: {
    type: String,
    required: true,
  },
  repeatEveryWeek: {
    type: Boolean,
    required: true,
    default: false,
  },
  day: {
    type: String,
    required: false,
  },
  date: {
    type: String,
    required: false,
  },
  // pri svakom getu da se date poveca za 7, i prisutni se stave na default
  professors: { type: mongoose.Schema.Types.ObjectId, ref: 'Professor' },
});

module.exports = mongoose.model('Consultation', consultationSchema);
