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
const User = require('../../models/User');

const transporter = nodemailer.createTransport({
  service: 'hotmail',
  auth: {
    user: process.env.HOTMAIL_USER,
    pass: process.env.HOTMAIL_PASSWORD,
  },
});

// Register
router.post('/register', async (req, res) => {
  // validate the data before adding the user
  const { error } = registerValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  // checking if the user with that email, username or jmbg is already in database
  const emailExists = await User.findOne({ email: req.body.email });
  if (emailExists) return res.status(400).send('Email adresa je zauzeta!');

  const usernameExists = await User.findOne({ username: req.body.username });
  if (usernameExists) return res.status(400).send('Korisničko ime je zauzeto!');

  const jmbgExists = await User.findOne({ JMBG: req.body.JMBG });
  if (jmbgExists)
    return res.status(400).send('Korisnik sa unetim JMBG već postoji!');

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
    JMBG: req.body.JMBG,
    phone_number: req.body.phone_number,
    account_type: req.body.account_type,
  });

  try {
    const savedUser = await user.save();

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
    expiresIn: 1,
  });
  res.header('auth-token', token).send(token);
});

// Try login with token
router.get('/login/:token', async (req, res) => {
  try {
    const verifiedToken = jwt.verify(
      req.params.token,
      process.env.TOKEN_SECRET
    );
    if (!!verifiedToken) return res.status(200);
    return res.status(400);
  } catch (err) {
    res.send(err);
  }
});

module.exports = router;
