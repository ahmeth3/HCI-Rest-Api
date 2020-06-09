const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    min: 3,
    max: 24,
  },
  password: {
    type: String,
    required: true,
    min: 6,
    max: 1024,
  },
  email: {
    type: String,
    required: true,
  },
  verified: {
    type: Boolean,
    default: false,
  },
  name: {
    type: String,
    required: true,
  },
  surname: {
    type: String,
    required: true,
  },
  DoB: {
    type: Date,
    required: true,
  },
  JMBG: {
    type: String,
    required: true,
    min: 13,
    max: 13,
  },
  phone_number: {
    type: String,
    required: true,
  },
  account_type: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model('User', userSchema);
