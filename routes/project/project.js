const router = require('express').Router();
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config();

const Consultation = require('../../models/Consultation');
const Project = require('../../models/Project');
const Subject = require('../../models/Subject');
const Professor = require('../../models/Professor');
const Student = require('../../models/Student');
const User = require('../../models/User');

// Create
router.post('/create/:token', async (req, res) => {
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

    const project = new Project({
      name: data.name,
      description: data.description,
      mandatory: data.mandatory,
      numberOfAttendees: data.numberOfAttendees,
      points: data.points,
      attendees: [],
      subject: data.subject,
    });

    const savedProject = await project.save();

    res.status(200).send(savedProject);
  } catch (err) {
    res.status(400).send(err);
  }
});

router.post('/list/:token', async (req, res) => {
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

    const projects = await Project.find({ subject: data.subjectId });

    var allProjs = [];

    for (var i = 0; i < projects.length; i++) {
      var myProj = false;
      if (projects[i].attendees.includes(userId)) {
        myProj = true;
      }

      allProjs = [
        ...allProjs,
        {
          name: projects[i].name,
          description: projects[i].description,
          mandatory: projects[i].mandatory,
          numberOfAttendees: projects[i].numberOfAttendees,
          points: projects[i].points,
          attendees: projects[i].attendees,
          subject: projects[i].subject,
          myProj: myProj,
          _id: projects[i]._id,
        },
      ];
    }

    return res.status(200).send(allProjs);
  } catch (err) {
    res.status(400).send(err);
  }
});

router.patch('/update/:token', async (req, res) => {
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

    const project = await Project.updateOne(
      { _id: data._id },
      {
        name: data.name,
        description: data.description,
        mandatory: data.mandatory,
        numberOfAttendees: data.numberOfAttendees,
        points: data.points,
        attendees: data.attendees,
        subject: data.subject,
      }
    );

    if (project) return res.status(200).send('Ažurirano!');
    else return res.status(400).send('Neuspešno!');
  } catch (err) {
    res.status(400).send(err);
  }
});

router.post('/delete/:id', async (req, res) => {
  try {
    const deletedProject = await Project.deleteOne({
      _id: req.params.id,
    });

    if (deletedProject) return res.status(200).send('Uspešno izbrisano!');
    else return res.status(400).send('Neuspešno brisanje!');
  } catch (error) {
    return res.status(400).send(error);
  }
});

module.exports = router;
