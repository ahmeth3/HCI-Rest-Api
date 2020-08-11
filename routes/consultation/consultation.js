const router = require('express').Router();

const Consultation = require('../../models/Consultation');

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

module.exports = router;
