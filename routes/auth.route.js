const router = require('express').Router();
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const {
  loginValidation,
  registerValidation,
} = require('../validations/auth.validation');
const auth = require('../middleware/auth.middleware');

router.post('/register', async (req, res) => {
  const { error } = registerValidation(req.body);
  if (error)
    return res
      .status(400)
      .send(
        error.details && error.details.length
          ? error.details[0].message
          : 'Thông tin không hợp lệ!'
      );

  const isUsernameExist = await User.findOne({ username: req.body.username });
  if (isUsernameExist) return res.status(400).send('Tên tài khoản đã được sử dụng!');

  const isEmailExist = await User.findOne({ email: req.body.email });
  if (isEmailExist) return res.status(400).send('Địa chỉ email đã được sử dụng!');

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
    res.status(500).send('Internal server error!');
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
          : 'Thông tin không hợp lệ!'
      );

  try {
    const user = await User.findOne({ username: req.body.username });
    if (!user) return res.status(400).send('Tên tài khoản không chính xác!');

    const isPasswordCorrect = await bcryptjs.compare(
      req.body.password,
      user.password
    );
    if (!isPasswordCorrect)
      return res.status(400).send('Mật khẩu không chính xác!');

    const token = jwt.sign({ _id: user._id }, process.env.TOKEN_SECRET, {
      expiresIn: '2d',
    });
    res.header('auth-token', token).send(token);
  } catch (error) {
    res.status(500).send('Internal server error!');
  }
});

router.post('/password/is-correct', auth, async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.user._id });
    if (!user) return res.status(404).send('Không tìm thấy người dùng!');

    const isPasswordCorrect = await bcryptjs.compare(
      req.body.password,
      user.password
    );

    res.status(200).send(isPasswordCorrect);
  } catch (error) {
    res.status(500).send('Internal server error!');
  }
});

router.post('/password/change', auth, async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.user._id });
    if (!user) return res.status(404).send('Không tìm thấy người dùng!');

    const isOldPasswordCorrect = await bcryptjs.compare(
      req.body.oldPassword,
      user.password
    );
    if (!isOldPasswordCorrect)
      return res.status(400).send('Mật khẩu cũ không chính xác!');

    const salt = await bcryptjs.genSalt(10);
    const hashPassword = await bcryptjs.hash(req.body.newPassword, salt);

    const updatedUser = await User.updateOne(
      {
        _id: req.user._id,
      },
      {
        $set: {
          password: hashPassword,
        },
      }
    );
    res.status(200).send(updatedUser);
  } catch (error) {
    res.status(500).send('Internal server error!');
  }
});

module.exports = router;
