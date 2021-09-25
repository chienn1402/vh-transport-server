const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const token = req.get('auth-token');
  if (!token) return res.status(401).send('Truy cập bị từ chối!');

  try {
    const verified = jwt.verify(token, process.env.TOKEN_SECRET);
    req.user = verified;
    next();
  } catch (error) {
    res.status(401).send('Truy cập bị từ chối!');
  }
};
