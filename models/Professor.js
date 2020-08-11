const mongoose = require('mongoose');

const professorSchema = new mongoose.Schema({
  //moda dodam departman i smer
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  subjects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Subject' }],
});

module.exports = mongoose.model('Professor', professorSchema);
