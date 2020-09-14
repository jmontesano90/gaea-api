require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const { NODE_ENV } = require('./config');

const app = express();

const morganOption = NODE_ENV === 'production' ? 'tiny' : 'common';
const winston = require('winston');
const dnaRouter = require('./DNA/dna-router');

app.use(morgan(morganOption));
app.use(express.json());
app.use(helmet());

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [new winston.transports.File({ filename: 'info.log' })],
});

if (NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple(),
    })
  );
}

// app.use(function validateBearerToken(req, res, next) {
//   const apiToken = process.env.API_TOKEN;
//   const authToken = req.get('Authorization');

//   if (!authToken || authToken.split(' ')[1] !== apiToken) {
//     logger.error(`Unauthorized request to path: ${req.path}`);
//     return res.status(401).json({ error: 'Unauthorized request' });
//   }
//   // move to the next middleware
//   next();
// });

app.use('/dna', dnaRouter);

app.post('/', (req, res) => {
  console.log(req.body);
  res.send('POST request received.');
});
app.post('/user', (req, res) => {
  // get the data
  const { username, password } = req.body;
  if (!username) {
    return res.status(400).send('Username required');
  }

  if (!password) {
    return res.status(400).send('Password required');
  }
  if (username.length < 6 || username.length > 20) {
    return res.status(400).send('Username must be between 6 and 20 characters');
  }

  // password length
  if (password.length < 8 || password.length > 36) {
    return res.status(400).send('Password must be between 8 and 36 characters');
  }

  // password contains digit, using a regex here
  if (!password.match(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/)) {
    return res.status(400).send('Password must be contain at least one digit');
  }
});
app.get('/', (req, res) => {
  res.send('A GET Request');
});
app.use(function errorHandler(error, req, res, next) {
  let response;
  if (NODE_ENV === 'production') {
    response = { error: { message: 'server error' } };
  } else {
    console.error(error);
    response = { message: error.message, error };
  }
  res.status(500).json(response);
});

app.use(cors());

module.exports = app;
