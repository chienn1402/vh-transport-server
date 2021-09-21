const Joi = require('@hapi/joi');

const registerValidation = (data) => {
  const scheme = Joi.object({
    username: Joi.string().min(6).required(),
    email: Joi.string().min(6).email().required(),
    password: Joi.string().min(6).required(),
  });

  return scheme.validate(data);
};

const loginValidation = (data) => {
  const scheme = Joi.object({
    username: Joi.string().min(6).required(),
    password: Joi.string().min(6).required(),
  });

  return scheme.validate(data);
};

module.exports.registerValidation = registerValidation;
module.exports.loginValidation = loginValidation;
