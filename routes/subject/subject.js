const router = require('express').Router();
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config();

const {
  createSubjectValidation,
} = require('../../validators/subjectValidator');
const Subject = require('../../models/Subject');
const User = require('../../models/User');
const Student = require('../../models/Student');

// Create
router.post('/create', async (req, res) => {
  // extract the data
  data = req.body;

  // validate the data before adding the subject
  const { error } = createSubjectValidation(data);
  if (error) return res.status(400).send(error.details[0].message);

  // checking if the subject aleady exists
  const subjectExists = await Subject.findOne({
    department: data.department,
    profile: data.profile,
    grade: data.grade,
    name: data.name,
    description: data.description,
  });
  if (subjectExists) return res.status(400).send('Predmet već postoji!');

  // create new subject
  const subject = new Subject({
    department: data.department,
    profile: data.profile,
    grade: data.grade,
    name: data.name,
    description: data.description,
  });

  try {
    const savedSubject = await subject.save();

    res.send({ subject: savedSubject });
  } catch (err) {
    res.status(400).send(err);
  }
});

// Get all of the subjects for Student
router.post('/fetchByCriteriaStudent/:token', async (req, res) => {
  try {
    const verifiedToken = jwt.verify(
      req.params.token,
      process.env.TOKEN_SECRET
    );

    var userId = mongoose.Types.ObjectId;
    userId = mongoose.Types.ObjectId(verifiedToken._id);

    const student = await Student.findOne({ user: userId });
    if (!student) {
      res.status(400).send('Nema takvog studenta!');
    }

    /* 
    For initial loading subjects will be fetched based on student's grade in database
    If that is not the case, then the grade criteria will be passed within the request
    */
    let gradeCriteria;
    if (req.body.grade != '0.') gradeCriteria = req.body.grade;
    else gradeCriteria = student.grade;

    const subjects = await Subject.find({
      department: { $elemMatch: { $eq: student.department } },
      profile: { $elemMatch: { $eq: student.profile } },
      grade: { $elemMatch: { $eq: gradeCriteria } },
    });

    res.status(200).send(subjects);
  } catch (err) {
    res.status(400).send(err);
  }
});

const addProfessorsToSubject = async function (data) {
  try {
    const updatedSubject = await Subject.updateOne(
      {
        _id: data._id,
      },
      {
        $push: { professors: { $each: data.professors } },
      }
    );
    return 'Predmet ažuriran';
  } catch (err) {
    return err;
  }
};

const removeProfessorFromSubject = async function (data) {
  try {
    const updatedSubject = await Subject.updateOne(
      {
        _id: data._id,
      },
      {
        $pull: { professors: data.professors },
      }
    );

    return 'Predmet ažuriran';
  } catch (err) {
    return err;
  }
};

const addStudentsToSubject = async function (data) {
  try {
    const updatedSubject = await Subject.updateOne(
      {
        _id: data._id,
      },
      {
        $push: { students: { $each: data.students } },
      }
    );
    return 'Predmet ažuriran';
  } catch (err) {
    return err;
  }
};

const removeStudentFromSubject = async function (data) {
  try {
    const updatedSubject = await Subject.updateOne(
      {
        _id: data._id,
      },
      {
        $pull: { students: data.students },
      }
    );

    return 'Predmet ažuriran';
  } catch (err) {
    return err;
  }
};

const getSubjectsName = async function (data) {
  try {
    const subjectName = await Subject.find(
      { _id: data._id },
      { _id: 0, name: 1 }
    );

    return subjectName[0].name;
  } catch (err) {
    throw err;
  }
};

module.exports = router;
module.exports.addProfessorsToSubject = addProfessorsToSubject;
module.exports.removeProfessorFromSubject = removeProfessorFromSubject;
module.exports.addStudentsToSubject = addStudentsToSubject;
module.exports.removeStudentFromSubject = removeStudentFromSubject;
module.exports.getSubjectsName = getSubjectsName;
