const router = require('express').Router();

const {
  createSubjectValidation,
} = require('../../validators/subjectValidator');
const Subject = require('../../models/Subject');

// Create
router.post('/create', async (req, res) => {
  // extract the data
  data = req.body;

  // validate the data before adding the subject
  const { error } = createSubjectValidation(data);
  if (error) return res.statusCode(400).send(error.details[0].message);

  // checking if the subject aleady exists
  const subjectExists = await Subject.findOne({
    department: data.department,
    profile: data.profile,
    grade: data.grade,
    name: data.name,
  });
  if (subjectExists) return res.status(400).send('Predmet već postoji!');

  // create new user
  const subject = new Subject({
    department: data.department,
    profile: data.profile,
    grade: data.grade,
    name: data.name,
  });

  try {
    const savedSubject = await subject.save();

    res.send({ subject: savedSubject });
  } catch (err) {
    res.status(400).send(err);
  }
});

// Get all of the subjects based on department, profile, grade
router.post('/fetchByCriteria', async (req, res) => {
  // extract the data
  data = req.body;

  try {
    const subjects = await Subject.find({
      department: data.department,
      profile: data.profile,
      grade: data.grade,
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
module.exports.addStudentsToSubject = addStudentsToSubject;
module.exports.getSubjectsName = getSubjectsName;
