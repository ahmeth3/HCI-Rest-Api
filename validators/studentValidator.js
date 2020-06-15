const Joi = require('@hapi/joi');

const updateBasicStudentValidation = (data) => {
  const schema = {
    studentIdNo: Joi.string().required(),
    department: Joi.string().required(),
    profile: Joi.string().required(),
    grade: Joi.string().required(),
    user: Joi.required(),
  };

  return Joi.validate(data, schema);
};

const updateStudentsSubjectsValidation = (data) => {
  const schema = {
    user: Joi.required(),
    subjects: Joi.required(),
  };

  return Joi.validate(data, schema);
};

module.exports.updateBasicStudentValidation = updateBasicStudentValidation;
module.exports.updateStudentsSubjectsValidation = updateStudentsSubjectsValidation;
