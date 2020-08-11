const Joi = require('@hapi/joi');

const updateBasicProfessorValidation = (data) => {
  const schema = {
    department: Joi.string().required(),
    profile: Joi.string().required(),
    user: Joi.required(),
  };

  return Joi.validate(data, schema);
};

const updateProfessorsSubjectsValidation = (data) => {
  const schema = {
    subjects: Joi.required(),
  };

  return Joi.validate(data, schema);
};

module.exports.updateBasicProfessorValidation = updateBasicProfessorValidation;
module.exports.updateProfessorsSubjectsValidation = updateProfessorsSubjectsValidation;
