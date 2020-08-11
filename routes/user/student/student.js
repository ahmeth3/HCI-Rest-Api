const router = require('express').Router();
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config();

const Student = require('../../../models/Student');

const {
  updateBasicStudentValidation,
  updateStudentsSubjectsValidation,
} = require('../../../validators/studentValidator');

const {
  addStudentsToSubject,
  removeStudentFromSubject,
  getSubjectsName,
} = require('../../subject/subject');

const createStudent = async function (data) {
  const student = new Student({
    studentIdNo: data.studentIdNo,
    department: data.department,
    profile: data.profile,
    grade: data.grade,
    user: data.user,
  });

  return await student.save();
};

// Update students info {studentIdNo, department, profile, grade}
router.patch('/update', async (req, res) => {
  // Extract the data
  data = req.body;

  // Validate the data before adding the subject
  const { error } = updateBasicStudentValidation(data);
  if (error) return res.status(400).send(error.details[0].message);

  // Checking if the user with that userID is in student table
  const studentExists = await Student.findOne({ user: data.user });
  if (!studentExists)
    return res.status(400).send('Korisnik sa tim id nije student!');

  try {
    const updatedStudent = await Student.updateOne(
      { user: req.body.user },
      {
        $set: {
          studentIdNo: req.body.studentIdNo,
          department: req.body.department,
          profile: req.body.profile,
          grade: req.body.grade,
        },
      }
    );
    res.json(updatedStudent);
  } catch (err) {
    res.status(400).send(err);
  }
});

// Update students subjects
router.patch('/update-subjects/:token', async (req, res) => {
  var userId = mongoose.Types.ObjectId;
  try {
    const verifiedToken = jwt.verify(
      req.params.token,
      process.env.TOKEN_SECRET
    );

    userId = mongoose.Types.ObjectId(verifiedToken._id);
  } catch (err) {
    return res.status(400).send('Istekao token!');
  }

  // Extract the data
  data = req.body;

  // Validate the data before adding the subject
  const { error } = updateStudentsSubjectsValidation(data);
  if (error) return res.status(400).send(error.details[0].message);

  // Checking if the user with that userID is in student table
  const studentExists = await Student.findOne({ user: userId });
  if (!studentExists)
    return res.status(400).send('Korisnik sa tim id nije student!');

  try {
    var subjects = await Student.find(
      { user: userId },
      { _id: 0, subjects: 1 }
    );

    subjects = subjects[0].subjects;

    const updatedStudent = await Student.updateOne(
      { user: userId },
      {
        subjects: data.subjects,
      }
    );

    for (i = 0; i < subjects.length; i++) {
      await removeStudentFromSubject({
        _id: subjects[i],
        students: userId,
      });
    }

    for (i = 0; i < data.subjects.length; i++) {
      await addStudentsToSubject({
        _id: data.subjects[i],
        students: [userId],
      });
    }

    res.json(updatedStudent);
  } catch (err) {
    res.status(400).send(err);
  }
});

// Get student's basic information existence
router.get('/basic-info/:user', async (req, res) => {
  const basicInfoExist = await Student.findOne({ user: req.params.user });
  if (basicInfoExist) {
    if (basicInfoExist.department != '')
      return res.status(200).send('Ima basic info');
    else return res.status(200).send('Nema basic info');
  }
  return res.status(400);
});

module.exports = router;
module.exports.createStudent = createStudent;
