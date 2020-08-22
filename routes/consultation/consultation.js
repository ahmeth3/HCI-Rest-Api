const router = require('express').Router();
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config();

const Consultation = require('../../models/Consultation');
const Subject = require('../../models/Subject');
const Professor = require('../../models/Professor');
const Student = require('../../models/Student');

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

    // check if user has already created consultation within the time range
    const cons = await Consultation.find({
      date: data.date,
      professor: userId,
    });

    if (cons) {
      var errorMessages = [];
      for (var i = 0; i < cons.length; i++) {
        var startTime = cons[i].startTime.split(':');
        var startTimeHour = startTime[0];
        var startTimeMinute = startTime[1];

        var startTimeMinutes =
          parseInt(startTimeHour) * 60 + parseInt(startTimeMinute);

        var endTime = cons[i].endTime.split(':');
        var endTimeHour = endTime[0];
        var endTimeMinute = endTime[1];

        var endTimeMinutes =
          parseInt(endTimeHour) * 60 + parseInt(endTimeMinute);

        var testedConsTime = data.startTime.split(':');
        var testedConsTimeHour = testedConsTime[0];
        var testedConsTimeMinute = testedConsTime[1];

        var testedConsTimeMinutes =
          parseInt(testedConsTimeHour) * 60 + parseInt(testedConsTimeMinute);

        if (
          (testedConsTimeMinutes >= startTimeMinutes &&
            testedConsTimeMinutes < endTimeMinutes) ||
          (testedConsTimeMinutes > startTimeMinutes - 120 &&
            testedConsTimeMinutes <= startTimeMinutes)
        )
          errorMessages.push(
            'Već imate konsultaciju tog dana u periodu od ' +
              cons[i].startTime +
              '-' +
              cons[i].endTime
          );
        if (errorMessages.length > 0)
          return res.status(400).send(errorMessages);
      }
    }

    const consulation = new Consultation({
      typeOFDate: data.typeOFDate,
      day: data.day,
      repeatEveryWeek: data.repeatEveryWeek,
      date: data.date,
      startTime: data.startTime,
      endTime: data.endTime,
      place: data.place,
      professor: userId,
    });

    const savedConsultation = await consulation.save();

    res.status(200).send(savedConsultation);
  } catch (err) {
    res.status(400).send(err);
  }
});

// Update consultations info
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

    // check if user has already created consultation within the time range
    const cons = await Consultation.find({
      date: data.date,
      professor: userId,
    });

    if (cons) {
      var errorMessages = [];
      for (var i = 0; i < cons.length; i++) {
        var startTime = cons[i].startTime.split(':');
        var startTimeHour = startTime[0];
        var startTimeMinute = startTime[1];

        var startTimeMinutes =
          parseInt(startTimeHour) * 60 + parseInt(startTimeMinute);

        var endTime = cons[i].endTime.split(':');
        var endTimeHour = endTime[0];
        var endTimeMinute = endTime[1];

        var endTimeMinutes =
          parseInt(endTimeHour) * 60 + parseInt(endTimeMinute);

        var testedConsTime = data.startTime.split(':');
        var testedConsTimeHour = testedConsTime[0];
        var testedConsTimeMinute = testedConsTime[1];

        var testedConsTimeMinutes =
          parseInt(testedConsTimeHour) * 60 + parseInt(testedConsTimeMinute);

        if (
          (testedConsTimeMinutes >= startTimeMinutes &&
            testedConsTimeMinutes < endTimeMinutes) ||
          (testedConsTimeMinutes > startTimeMinutes - 120 &&
            testedConsTimeMinutes <= startTimeMinutes)
        )
          errorMessages.push(
            'Već imate konsultaciju tog dana u periodu od ' +
              cons[i].startTime +
              '-' +
              cons[i].endTime
          );
        if (errorMessages.length > 0)
          return res.status(400).send(errorMessages);
      }
    }

    const consultation = await Consultation.updateOne(
      { _id: data._id },
      {
        typeOFDate: data.typeOFDate,
        day: data.day,
        repeatEveryWeek: data.repeatEveryWeek,
        date: data.date,
        startTime: data.startTime,
        endTime: data.endTime,
        place: data.place,
      }
    );

    if (consultation) return res.status(200).send('Ažurirano!');
    else return res.status(400).send('Neuspešno!');
  } catch (err) {
    res.status(400).send(err);
  }
});

// Delete consultation
router.post('/delete/:id', async (req, res) => {
  try {
    const deletedConsultation = await Consultation.deleteOne({
      _id: req.params.id,
    });

    if (deletedConsultation) return res.status(200).send('Uspešno izbrisano!');
    else return res.status(400).send('Neuspešno brisanje!');
  } catch (error) {
    return res.status(400).send(error);
  }
});

// Get consultations for professor
router.get('/professor/:token', async (req, res) => {
  try {
    // verify the token
    const verifiedToken = jwt.verify(
      req.params.token,
      process.env.TOKEN_SECRET
    );

    // extract the user id from token
    var userId = mongoose.Types.ObjectId;
    userId = mongoose.Types.ObjectId(verifiedToken._id);

    const consultation = await Consultation.find({
      professor: userId,
    });

    if (consultation) return res.status(200).send({ data: consultation });
    else return res.status(200).send('Nemate konsultacija!');
  } catch (err) {
    res.status(400).send(err);
  }
});

// Get student's consultations
router.get('/student/:token', async (req, res) => {
  try {
    // verify the token
    const verifiedToken = jwt.verify(
      req.params.token,
      process.env.TOKEN_SECRET
    );

    // extract the user id from token
    var userId = mongoose.Types.ObjectId;
    userId = mongoose.Types.ObjectId(verifiedToken._id);

    // Getting students subjects
    const studentsSubjects = await Subject.find({
      students: userId,
    });

    var studentsProfessors = [];

    for (var i = 0; i < studentsSubjects.length; i++) {
      for (var j = 0; j < studentsSubjects[i].professors.length; j++)
        if (
          !studentsProfessors.includes(
            studentsSubjects[i].professors[j].toString()
          )
        )
          studentsProfessors.push(studentsSubjects[i].professors[j].toString());
    }

    var studentsConsultations = [];

    for (var i = 0; i < studentsProfessors.length; i++) {
      const profCons = await Consultation.find({
        professor: studentsProfessors[i],
      });

      if (profCons.length > 0)
        studentsConsultations = [...studentsConsultations, profCons];
    }

    return res.send({ data: studentsConsultations });
  } catch (err) {
    res.status(400).send(err);
  }
});

module.exports = router;
