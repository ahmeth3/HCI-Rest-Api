const Joi = require('@hapi/joi');

// Register Validation
const registerValidation = (data) => {
  const schema = {
    email: Joi.string().required().email(),
    password: Joi.string().required().min(6).alphanum(),
    name: Joi.string().required(),
    surname: Joi.string().required(),
    DoB: Joi.date().required(),
    account_type: Joi.string().required(),
  };

  return Joi.validate(data, schema);
};

// Login Validation with username
const loginWithUsernameValidation = (data) => {
  schema = {
    username: Joi.string().required().min(6).max(24),
    password: Joi.string().required().min(6).alphanum(),
  };
  return Joi.validate(data, schema);
};

// Login Validation with email address
const loginWithEmailValidation = (data) => {
  schema = {
    email: Joi.string().required().email(),
    password: Joi.string().required(),
  };
  return Joi.validate(data, schema);
};

module.exports.registerValidation = registerValidation;
module.exports.loginWithUsernameValidation = loginWithUsernameValidation;
module.exports.loginWithEmailValidation = loginWithEmailValidation;
