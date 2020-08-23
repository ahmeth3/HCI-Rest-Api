const router = require('express').Router();
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config();

const Student = require('../../../models/Student');
const Subject = require('../../../models/Subject');
const User = require('../../../models/User');
const Project = require('../../../models/Project');

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
router.get('/basic-info/:token', async (req, res) => {
  try {
    const verifiedToken = jwt.verify(
      req.params.token,
      process.env.TOKEN_SECRET
    );

    var userId = mongoose.Types.ObjectId;
    userId = mongoose.Types.ObjectId(verifiedToken._id);

    const basicInfoExist = await Student.findOne({ user: userId });

    if (basicInfoExist.subjects.length > 0)
      return res.status(200).send('Ima basic info');
    else return res.status(200).send('Nema basic info');
  } catch (err) {
    res.status(400).send(err);
  }
});

// Get professor' subjects
router.get('/mySubjects/:token', async (req, res) => {
  try {
    const verifiedToken = jwt.verify(
      req.params.token,
      process.env.TOKEN_SECRET
    );

    var userId = mongoose.Types.ObjectId;
    userId = mongoose.Types.ObjectId(verifiedToken._id);

    const mySubjects = await Subject.find({ students: userId });
    if (mySubjects) res.status(200).send(mySubjects);
    else res.status(400).send('Nema predmeta!');
  } catch (err) {
    res.status(400).send(err);
  }
});

// Get professor's subjects for projects
router.get('/projectSubjects/:token', async (req, res) => {
  try {
    const verifiedToken = jwt.verify(
      req.params.token,
      process.env.TOKEN_SECRET
    );

    var userId = mongoose.Types.ObjectId;
    userId = mongoose.Types.ObjectId(verifiedToken._id);

    const mySubjects = await Subject.find({ students: userId });

    var subj = [];

    for (var i = 0; i < mySubjects.length; i++) {
      var profsNames = [];
      var profs = await User.find({
        _id: mySubjects[i].professors,
      });

      for (var j = 0; j < profs.length; j++) {
        if (!profsNames.includes(profs[j].name + ' ' + profs[j].surname))
          profsNames.push(profs[j].name + ' ' + profs[j].surname);
      }

      subj = [
        ...subj,
        {
          _id: mySubjects[i]._id,
          department: mySubjects[i].department,
          profile: mySubjects[i].profile,
          grade: mySubjects[i].grade,
          students: mySubjects[i].students,
          professors: mySubjects[i].professors,
          name: mySubjects[i].name,
          description: mySubjects[i].description,
          professorsNames: profsNames,
        },
      ];
    }

    return res.status(200).send(subj);
  } catch (err) {
    res.status(400).send(err);
  }
});

router.patch('/attend/:token', async (req, res) => {
  try {
    // verify the token
    const verifiedToken = jwt.verify(
      req.params.token,
      process.env.TOKEN_SECRET
    );

    // extract the user id from token
    var userId = mongoose.Types.ObjectId;
    userId = mongoose.Types.ObjectId(verifiedToken._id);

    data = req.body;

    const proj = await Project.findOne({ _id: data._id });

    var updatedAttendees = proj.attendees;

    updatedAttendees.push(userId);

    const project = await Project.updateOne(
      { _id: data._id },
      {
        attendees: updatedAttendees,
      }
    );

    if (project) return res.status(200).send('Ažurirano!');
    else return res.status(400).send('Neuspešno!');
  } catch (err) {
    res.status(400).send(err);
  }
});

router.patch('/giveUp/:token', async (req, res) => {
  try {
    // verify the token
    const verifiedToken = jwt.verify(
      req.params.token,
      process.env.TOKEN_SECRET
    );

    // extract the user id from token
    var userId = mongoose.Types.ObjectId;
    userId = mongoose.Types.ObjectId(verifiedToken._id);

    data = req.body;

    const proj = await Project.findOne({ _id: data._id });

    var updatedAttendees = proj.attendees;

    updatedAttendees = updatedAttendees.filter((element) => element != userId);

    const project = await Project.updateOne(
      { _id: data._id },
      {
        attendees: updatedAttendees,
      }
    );

    if (project) return res.status(200).send('Ažurirano!');
    else return res.status(400).send('Neuspešno!');
  } catch (err) {
    res.status(400).send(err);
  }
});

module.exports = router;
module.exports.createStudent = createStudent;
