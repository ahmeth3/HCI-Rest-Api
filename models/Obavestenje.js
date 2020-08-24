const mongoose = require('mongoose');

const obavestenjeSchema = new mongoose.Schema({
  obavestenje: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model('Obavestenje', obavestenjeSchema);
