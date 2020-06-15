const router = require('express').Router();

const Student = require('../../../models/Student');

const {
  updateBasicStudentValidation,
  updateStudentsSubjectsValidation,
} = require('../../../validators/studentValidator');

const {
  addStudentsToSubject,
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
router.patch('/update-subjects', async (req, res) => {
  // Extract the data
  data = req.body;

  // Validate the data before adding the subject
  const { error } = updateStudentsSubjectsValidation(data);
  if (error) return res.status(400).send(error.details[0].message);

  // Checking if the user with that userID is in student table
  const studentExists = await Student.findOne({ user: data.user });
  if (!studentExists)
    return res.status(400).send('Korisnik sa tim id nije student!');

  // Array that stores the subjects that student already has (used for displaying error message to user)
  var subjectExist = [];

  // for loop that stores subjects that user already has in database in subjectExist array
  for (i = 0; i < data.subjects.length; i++) {
    const subjectExists = await Student.findOne({
      user: data.user,
      subjects: data.subjects[i],
    });

    if (!!subjectExists) {
      subjectName = await getSubjectsName({ _id: data.subjects[i] });
      subjectExist.push(subjectName);
    }
  }

  // Error message that gives information about which subjects user already has entered
  if (subjectExist.length > 0) {
    return res
      .status(400)
      .send('Već ste aktivni na predmetima: ' + subjectExist.toString());
  }

  try {
    const updatedStudent = await Student.updateOne(
      { user: data.user },
      {
        $push: {
          subjects: { $each: data.subjects },
        },
      }
    );

    for (i = 0; i < data.subjects.length; i++) {
      await addStudentsToSubject({
        _id: data.subjects[i],
        students: [data.user],
      });
    }

    res.json(updatedStudent);
  } catch (err) {
    res.status(400).send(err);
  }
});

module.exports = router;
module.exports.createStudent = createStudent;
