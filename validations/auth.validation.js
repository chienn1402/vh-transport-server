const Joi = require('joi');

const registerValidation = (data) => {
  const scheme = Joi.object({
    username: Joi.string().min(6).required().messages({
      'string.empty': 'Tên tài khoản không được để trống!',
      'string.base': 'Tên tài khoản không đúng định dạng!',
      'string.min': 'Tên tài khoản phải chứa ít nhất 6 ký tự!',
    }),
    email: Joi.string().min(6).email().required().messages({
      'string.empty': 'Email không được để trống!',
      'string.base': 'Email không đúng định dạng!',
      'string.email': 'Email không đúng định dạng!',
      'string.min': 'Email phải chứa ít nhất 6 ký tự!',
    }),
    password: Joi.string().min(6).required().messages({
      'string.empty': 'Mật khẩu không được để trống!',
      'string.base': 'Mật khẩu không đúng định dạng!',
      'string.min': 'Mật khẩu phải chứa ít nhất 6 ký tự!',
    }),
  });

  return scheme.validate(data);
};

const loginValidation = (data) => {
  const scheme = Joi.object({
    username: Joi.string().min(6).required().messages({
      'string.empty': 'Tên tài khoản không được để trống!',
      'string.base': 'Tên tài khoản không đúng định dạng!',
      'string.min': 'Tên tài khoản phải chứa ít nhất 6 ký tự!',
    }),
    password: Joi.string().min(6).required().messages({
      'string.empty': 'Mật khẩu không được để trống!',
      'string.base': 'Mật khẩu không đúng định dạng!',
      'string.min': 'Mật khẩu phải chứa ít nhất 6 ký tự!',
    }),
  });

  return scheme.validate(data);
};

module.exports.registerValidation = registerValidation;
module.exports.loginValidation = loginValidation;
