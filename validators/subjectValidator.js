const Joi = require('@hapi/joi');

const createSubjectValidation = (data) => {
  const schema = {
    department: Joi.string().required(),
    profile: Joi.string().required(),
    grade: Joi.string().required(),
    name: Joi.string().required(),
  };

  return Joi.validate(data, schema);
};

module.exports.createSubjectValidation = createSubjectValidation;
