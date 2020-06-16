const router = require('express').Router();

const Professor = require('../../../models/Professor');

const {
  updateBasicProfessorValidation,
  updateProfessorsSubjectsValidation,
} = require('../../../validators/professorValidator');

const {
  addProfessorsToSubject,
  getSubjectsName,
} = require('../../subject/subject');

const createProfessor = async function (data) {
  const professor = new Professor({
    department: data.department,
    profile: data.profile,
    user: data.user,
  });

  return await professor.save();
};

// Update professors info {department, profile}
router.patch('/update', async (req, res) => {
  // Extract the data
  data = req.body;

  // Validate the data before adding the professor
  const { error } = updateBasicProfessorValidation(data);
  if (error) return res.status(400).send(error.details[0].message);

  // Checking if the user with that userID is in professor table
  const professorExists = await Professor.findOne({ user: data.user });
  if (!professorExists)
    return res.status(400).send('Korisnik sa tim id nije profesor!');

  try {
    const updatedProfessor = await Professor.updateOne(
      { user: req.body.user },
      {
        $set: {
          department: req.body.department,
          profile: req.body.profile,
        },
      }
    );
    res.json(updatedProfessor);
  } catch (err) {
    res.status(400).send(err);
  }
});

// Update professor's subjects
router.patch('/update-subjects', async (req, res) => {
  // Extract the data
  data = req.body;

  // Validate the data before adding the professor's info
  const { error } = updateProfessorsSubjectsValidation(data);
  if (error) return res.status(400).send(error.details[0].message);

  // Checking if the user with that userID is in professor table
  const professorExists = await Professor.findOne({ user: data.user });
  if (!professorExists)
    return res.status(400).send('Korisnik sa tim id nije profesor!');

  // Array that stores the subjects that student already has (used for displaying error message to user)
  var subjectExist = [];

  // for loop that stores subjects that user already has in database in subjectExist array
  for (i = 0; i < data.subjects.length; i++) {
    const subjectExists = await Professor.findOne({
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
    const updatedProfessor = await Professor.updateOne(
      { user: data.user },
      {
        $push: {
          subjects: { $each: data.subjects },
        },
      }
    );

    for (i = 0; i < data.subjects.length; i++) {
      await addProfessorsToSubject({
        _id: data.subjects[i],
        professors: [data.user],
      });
    }

    res.json(updatedProfessor);
  } catch (err) {
    res.status(400).send(err);
  }
});

// Get professor's basic information existence
router.get('/basic-info/:user', async (req, res) => {
  const basicInfoExist = await Professor.findOne({ user: req.params.user });
  if (basicInfoExist) {
    if (basicInfoExist.department != '')
      return res.status(200).send('Ima basic info');
    else return res.status(200).send('Nema basic info');
  }
  return res.status(400);
});

module.exports = router;
module.exports.createProfessor = createProfessor;
