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

router.get('/list/:subjectId', async (req, res) => {
  const projects = await Project.find({ subject: req.params.subjectId });

  return res.status(200).send(projects);
});

module.exports = router;
