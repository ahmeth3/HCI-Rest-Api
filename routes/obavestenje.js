const router = require('express').Router();
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config();

const Obavestenje = require('../models/Obavestenje');

// Create
router.post('/create', async (req, res) => {
  // extract the data
  data = req.body;

  // create new subject
  const obavestenje = new Obavestenje({
    obavestenje: data.obavestenje,
  });

  try {
    const pom = await obavestenje.save();

    res.send(pom);
  } catch (err) {
    res.status(400).send(err);
  }
});

router.get('/list', async (req, res) => {
  const obavestenje = await Obavestenje.find();

  return res.status(200).send(obavestenje);
});

module.exports = router;
