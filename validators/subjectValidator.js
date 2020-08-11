const Joi = require('@hapi/joi');

const createSubjectValidation = (data) => {
  const schema = {
    department: Joi.array().items(Joi.string()).required(),
    profile: Joi.array().items(Joi.string()).required(),
    grade: Joi.array().items(Joi.string()).required(),
    name: Joi.string().required(),
    description: Joi.string().required(),
  };

  return Joi.validate(data, schema);
};

module.exports.createSubjectValidation = createSubjectValidation;
