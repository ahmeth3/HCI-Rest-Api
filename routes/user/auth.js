const router = require('express').Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config();

const {
  registerValidation,
  loginWithUsernameValidation,
  loginWithEmailValidation,
} = require('../../validators/authValidator');

const {
  updateBasicStudentValidation,
} = require('../../validators/studentValidator');

const User = require('../../models/User');

const { createProfessor } = require('./professor/professor.js');
const { createStudent } = require('./student/student.js');
const Student = require('../../models/Student');

const transporter = nodemailer.createTransport({
  service: 'hotmail',
  auth: {
    user: process.env.HOTMAIL_USER,
    pass: process.env.HOTMAIL_PASSWORD,
  },
});

// Register
router.post('/register', async (req, res) => {
  // extract the data
  data = {
    username: req.body.username,
    password: req.body.password,
    email: req.body.email,
    name: req.body.name,
    surname: req.body.surname,
    DoB: req.body.DoB,
    account_type: req.body.account_type,
  };

  // validate the data before adding the user
  const { error } = registerValidation(data);
  if (error) return res.status(400).send(error.details[0].message);

  // validate the data related to student before adding the user, and student later
  var studentData;
  if (data.account_type === 'Student') {
    studentData = {
      studentIdNo: req.body.studentIdNo,
      department: req.body.department,
      profile: req.body.profile,
      grade: req.body.grade,
    };

    const studentIdNoExists = await Student.findOne({
      studentIdNo: studentData.studentIdNo,
    });
    if (studentIdNoExists)
      return res.status(400).send('Taj broj indeksa već postoji!');

    const { error } = updateBasicStudentValidation(studentData);
    if (error) return res.status(400).send(error.details[0].message);
  }

  // checking if the user with that email, username or jmbg is already in database
  const emailExists = await User.findOne({ email: req.body.email });
  if (emailExists) return res.status(400).send('Email adresa je zauzeta!');

  const usernameExists = await User.findOne({ username: req.body.username });
  if (usernameExists) return res.status(400).send('Korisničko ime je zauzeto!');

  // hash the password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(req.body.password, salt);

  // create new user
  const user = new User({
    username: req.body.username,
    password: hashedPassword,
    email: req.body.email,
    name: req.body.name,
    surname: req.body.surname,
    DoB: req.body.DoB,
    account_type: req.body.account_type,
  });

  try {
    const savedUser = await user.save();

    // create a record of this user in Student or Professor table according to his account_type
    if (user.account_type === 'Student') {
      await createStudent({
        studentIdNo: studentData.studentIdNo,
        department: studentData.department,
        profile: studentData.profile,
        grade: studentData.grade,
        user: user._id,
      });
    }

    if (user.account_type === 'Profesor') {
      await createProfessor({
        department: '',
        profile: '',
        user: user._id,
      });
    }

    await jwt.sign(
      { _id: user._id },
      process.env.EMAIL_SECRET,
      { expiresIn: '1d' },
      (err, emailToken) => {
        const url = `https://blooming-castle-17380.herokuapp.com/user/confirmation/${emailToken}`;

        transporter
          .sendMail({
            from: process.env.HOTMAIL_USER,
            to: user.email,
            subject: 'Potvrdite email adresu',
            html: `Molimo Vas kliknite ovde da biste potvrdili email adresu: <a href="${url}">${url}</a>`,
          })
          .catch(err);
      }
    );

    res.send({ user: user });
  } catch (err) {
    res.status(400).send(err);
  }
});

// Email confirmation
router.get('/confirmation/:emailToken', async (req, res) => {
  try {
    const decodedToken = jwt.verify(
      req.params.emailToken,
      process.env.EMAIL_SECRET
    );
    await User.updateOne(
      { _id: decodedToken._id },
      { $set: { verified: true } }
    );
    res.send('Email je potvrđen!');
  } catch (err) {
    res.send(err);
  }
});

// Login
router.post('/login', async (req, res) => {
  // extract the data
  data = req.body;

  // validate the data based on the type of credentials (username or email) user is trying to login
  let error;
  if (data.username) {
    ({ error } = loginWithUsernameValidation(data));
  } else if (data.email) {
    ({ error } = loginWithEmailValidation(data));
  }
  if (error) return res.status(400).send(error.details[0].message);

  // check if the username/email already exists
  let user;
  if (data.username) {
    user = await User.findOne({ username: data.username });
    if (!user) return res.status(400).send('Korisničko ime je pogrešno');
  } else if (data.email) {
    user = await User.findOne({ email: data.email });
    if (!user) return res.status(400).send('Email adresa je pogrešna');
  }

  //check if password is correct
  const validPassword = await bcrypt.compare(data.password, user.password);
  if (!validPassword) return res.status(400).send('Pogrešna lozinka');

  if (!user.verified)
    return res.status(400).send('Molim Vas potvrdite svoj mejl!');

  // create and assign a token
  const token = jwt.sign({ _id: user._id }, process.env.TOKEN_SECRET, {
    expiresIn: '24h',
  });

  // res.header('auth_token', token).send(user);
  res.status(200).send(token);
});

// Try login with token
router.post('/login/:token', async (req, res) => {
  try {
    const verifiedToken = jwt.verify(
      req.params.token,
      process.env.TOKEN_SECRET
    );

    return res.status(200).send();
  } catch (err) {
    res.status(400).send();
  }
});

module.exports = router;
