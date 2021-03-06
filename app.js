const express = require('express');
const app = express();
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const cors = require('cors');

// Import routes
const authRoute = require('./routes/user/auth');
const studentRoute = require('./routes/user/student/student');
const professorRoute = require('./routes/user/professor/professor');
const subjectRoute = require('./routes/subject/subject');
const consultationRoute = require('./routes/consultation/consultation');
const projectRoute = require('./routes/project/project');

// Middlewares
dotenv.config();
app.use(express.json());
app.use(cors());

// Route Middlewares
app.use('/user', authRoute);
app.use('/student', studentRoute);
app.use('/professor', professorRoute);
app.use('/subject', subjectRoute);
app.use('/consultation', consultationRoute);
app.use('/project', projectRoute);

// Connect to DB
mongoose.connect(
  process.env.DB_CONNECT,
  { useNewUrlParser: true, useUnifiedTopology: true },
  () => console.log('Connection to DB successful!')
);

const PORT = process.env.PORT || 3000;

// Runs the server on port 3000
app.listen(PORT, () => console.log('Server is up and running!'));
