const router = require('express').Router();
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {
  loginValidation,
  registerValidation,
} = require('../validations/auth.validation');
const auth = require('../middleware/auth.middleware');
const pool = require('../db');

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

  try {
    const promisePool = pool.promise();
    const [isUsernameExist] = await promisePool.query(
      'SELECT * FROM users where `username` = ?',
      req.body.username
    );
    if (isUsernameExist[0])
      return res.status(400).send('Tên tài khoản đã được sử dụng!');

    if (req.body.email) {
      const [isEmailExist] = await promisePool.query(
        'SELECT * FROM users where `email` = ?',
        req.body.email
      );
      if (isEmailExist[0])
        return res.status(400).send('Địa chỉ email đã được sử dụng!');
    }

    const salt = await bcryptjs.genSalt(10);
    const hashPassword = await bcryptjs.hash(req.body.password, salt);

    const user = {
      username: req.body.username,
      email: req.body.email,
      password: hashPassword,
    };

    const [savedUser] = await promisePool.query(
      'INSERT INTO users set ?',
      user
    );
    res.status(200).send(savedUser);
  } catch (error) {
    res.status(500).send({ error });
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
    const promisePool = pool.promise();
    const [users] = await promisePool.query(
      'SELECT * FROM users where `username` = ?',
      req.body.username
    );
    if (!users[0])
      return res.status(400).send('Tên tài khoản không chính xác!');

    const isPasswordCorrect = await bcryptjs.compare(
      req.body.password,
      users[0].password
    );
    if (!isPasswordCorrect)
      return res.status(400).send('Mật khẩu không chính xác!');

    const token = jwt.sign({ _id: users[0]._id }, process.env.TOKEN_SECRET, {
      expiresIn: '2d',
    });
    res.header('auth-token', token).send(token);
  } catch (error) {
    res.status(500).send({ error });
  }
});

router.post('/password/is-correct', auth, async (req, res) => {
  try {
    const promisePool = pool.promise();
    const [users] = await promisePool.query(
      'SELECT * FROM users where `_id` = ?',
      req.user._id
    );
    if (!users[0]) return res.status(404).send('Không tìm thấy người dùng!');

    const isPasswordCorrect = await bcryptjs.compare(
      req.body.password,
      users[0].password
    );

    res.status(200).send(isPasswordCorrect);
  } catch (error) {
    res.status(500).send({ error });
  }
});

router.post('/password/change', auth, async (req, res) => {
  try {
    const promisePool = pool.promise();
    const [users] = await promisePool.query(
      'SELECT * FROM users where `_id` = ?',
      req.user._id
    );
    if (!users[0]) return res.status(404).send('Không tìm thấy người dùng!');

    const isOldPasswordCorrect = await bcryptjs.compare(
      req.body.oldPassword,
      users[0].password
    );
    if (!isOldPasswordCorrect)
      return res.status(400).send('Mật khẩu cũ không chính xác!');

    const salt = await bcryptjs.genSalt(10);
    const hashPassword = await bcryptjs.hash(req.body.newPassword, salt);

    const [updatedUser] = await promisePool.query(
      'UPDATE users SET `password` = ? where `_id` = ?',
      [hashPassword, req.user._id]
    );
    res.status(200).send({ modifiedCount: updatedUser.affectedRows });
  } catch (error) {
    res.status(500).send({ error });
  }
});

module.exports = router;
