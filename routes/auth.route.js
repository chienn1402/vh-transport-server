const router = require('express').Router();
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const {
  loginValidation,
  registerValidation,
} = require('../validations/auth.validation');

router.post('/register', async (req, res) => {
  const { error } = registerValidation(req.body);
  if (error)
    return res
      .status(400)
      .send(
        error.details && error.details.length
          ? error.details[0].message
          : 'Invalid data!'
      );

  const isUsernameExist = await User.findOne({ username: req.body.username });
  if (isUsernameExist) return res.status(400).send('Username already exists!');

  const isEmailExist = await User.findOne({ email: req.body.email });
  if (isEmailExist) return res.status(400).send('Email already exists!');

  const salt = await bcryptjs.genSalt(10);
  const hashPassword = await bcryptjs.hash(req.body.password, salt);

  const user = new User({
    username: req.body.username,
    email: req.body.email,
    password: hashPassword,
  });

  try {
    const savedUser = await user.save();
    res.status(200).send(savedUser);
  } catch (error) {
    res.status(400).send(error);
  }
});

router.post('/login', async (req, res) => {
  const { error } = loginValidation(req.body);
  if (error)
    return res
      .status(400)
      .send(
        error.details && error.details.length
          ? error.details[0].message
          : 'Invalid data!'
      );

  try {
    const user = await User.findOne({ username: req.body.username });
    if (!user) return res.status(400).send('Username is incorrect!');

    const isPasswordCorrect = await bcryptjs.compare(
      req.body.password,
      user.password
    );
    if (!isPasswordCorrect)
      return res.status(400).send('Password is incorrect!');

    const token = jwt.sign({ _id: user._id }, process.env.TOKEN_SECRET, {
      expiresIn: '2d',
    });
    res.header('auth-token', token).send(token);
  } catch (error) {
    console.log(error);
    res.status(400).send(error);
  }
});

module.exports = router;
