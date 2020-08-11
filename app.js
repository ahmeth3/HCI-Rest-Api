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

// Middlewares
dotenv.config();
app.use(express.json());
app.use(cors({ origin: true, credentials: true }));

// app.use(function (req, res, next) {
//   // Website you wish to allow to connect
//   res.setHeader('Access-Control-Allow-Origin', '*');

//   // Request methods you wish to allow
//   res.setHeader(
//     'Access-Control-Allow-Methods',
//     'GET, POST, OPTIONS, PUT, PATCH, DELETE'
//   );

//   // Request headers you wish to allow
//   res.setHeader(
//     'Access-Control-Allow-Headers',
//     'X-Requested-With,content-type'
//   );

//   // Set to true if you need the website to include cookies in the requests sent
//   // to the API (e.g. in case you use sessions)
//   res.setHeader('Access-Control-Allow-Credentials', true);

//   // Pass to next layer of middleware
//   next();
// });

// Route Middlewares
app.use('/user', authRoute);
app.use('/student', studentRoute);
app.use('/professor', professorRoute);
app.use('/subject', subjectRoute);
app.use('/consultation', consultationRoute);

// Connect to DB
mongoose.connect(
  process.env.DB_CONNECT,
  { useNewUrlParser: true, useUnifiedTopology: true },
  () => console.log('Connection to DB successful!')
);

const PORT = process.env.PORT || 3000;

// Runs the server on port 3000
app.listen(PORT, () => console.log('Server is up and running!'));
