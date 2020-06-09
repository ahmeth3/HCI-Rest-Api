const express = require('express');
const app = express();
const dotenv = require('dotenv');
const mongoose = require('mongoose');

// Import routes
const authRoute = require('./routes/user/auth');

// Middlewares
dotenv.config();
app.use(express.json());

// Route Middlewares
app.use('/user', authRoute);

// Connect to DB
mongoose.connect(
  process.env.DB_CONNECT,
  { useNewUrlParser: true, useUnifiedTopology: true },
  () => console.log('Connection to DB successful!')
);

// Runs the server on port 3000
app.listen(3000, () => console.log('Server is up and running!'));
