const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
    min: 6,
    max: 1024,
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
  account_type: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model('User', userSchema);
