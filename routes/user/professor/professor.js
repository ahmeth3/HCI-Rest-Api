const router = require('express').Router();
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config();

const Professor = require('../../../models/Professor');

const {
  updateBasicProfessorValidation,
  updateProfessorsSubjectsValidation,
} = require('../../../validators/professorValidator');

const {
  addProfessorsToSubject,
  removeProfessorFromSubject,
  getSubjectsName,
} = require('../../subject/subject');

const {
  loginWithUsernameValidation,
} = require('../../../validators/authValidator');

const createProfessor = async function (data) {
  const professor = new Professor({
    user: data.user,
  });

  return await professor.save();
};

// Update professor's subjects
router.patch('/update-subjects/:token', async (req, res) => {
  var userId = mongoose.Types.ObjectId;
  try {
    const verifiedToken = jwt.verify(
      req.params.token,
      process.env.TOKEN_SECRET
    );

    userId = mongoose.Types.ObjectId(verifiedToken._id);
  } catch (err) {
    res.status(400).send();
  }

  // Extract the data
  data = req.body;

  // Validate the data before adding the professor's info
  const { error } = updateProfessorsSubjectsValidation(data);
  if (error) return res.status(400).send(error.details[0].message);

  // Checking if the user with that userID is in professor table
  const professorExists = await Professor.findOne({ user: userId });
  if (!professorExists)
    return res.status(400).send('Korisnik sa tim id nije profesor!');

  try {
    var subjects = await Professor.find(
      { user: userId },
      { _id: 0, subjects: 1 }
    );

    subjects = subjects[0].subjects;

    const updatedProfessor = await Professor.updateOne(
      { user: userId },
      {
        subjects: data.subjects,
      }
    );

    for (i = 0; i < subjects.length; i++) {
      console.log(subjects[i]);
      await removeProfessorFromSubject({
        _id: subjects[i],
        professors: userId,
      });
    }

    for (i = 0; i < data.subjects.length; i++) {
      await addProfessorsToSubject({
        _id: data.subjects[i],
        professors: [userId],
      });
    }
    res.json(updatedProfessor);
  } catch (err) {
    res.status(400).send(err);
  }
});

// Get professor's basic information existence
router.get('/basic-info/:token', async (req, res) => {
  try {
    const verifiedToken = jwt.verify(
      req.params.token,
      process.env.TOKEN_SECRET
    );

    var userId = mongoose.Types.ObjectId;
    userId = mongoose.Types.ObjectId(verifiedToken._id);

    const basicInfoExist = await Professor.findOne({ user: userId });

    if (basicInfoExist.subjects.length > 0)
      return res.status(200).send('Ima basic info');
    else return res.status(200).send('Nema basic info');
  } catch (err) {
    res.status(400).send(err);
  }
});

module.exports = router;
module.exports.createProfessor = createProfessor;
