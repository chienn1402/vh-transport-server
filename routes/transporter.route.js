const router = require('express').Router();
const transporterValidation = require('../validations/transporter.validation');
const auth = require('../middleware/auth.middleware');
const moment = require('moment');
const pool = require('../db');
const { DATE_TIME_FORMAT, EARLIEST_DATE } = require('../config');

router.get('/', async (req, res) => {
  const name = req.query.name || '';
  const phoneNumber = req.query.phoneNumber || '';
  const status = req.query.status || '1,2';
  const createdDateFrom = req.query.createdDateFrom
    ? moment(req.query.createdDateFrom).startOf('d').format(DATE_TIME_FORMAT)
    : moment(EARLIEST_DATE).startOf('d').format(DATE_TIME_FORMAT);
  const createdDateTo = req.query.createdDateTo
    ? moment(req.query.createdDateTo).endOf('d').format(DATE_TIME_FORMAT)
    : moment().endOf('d').format(DATE_TIME_FORMAT);

  try {
    const queryStr = 'SELECT * FROM transporters WHERE '
      + 'UPPER(`name`) LIKE UPPER(\'%' + name + '%\') AND '
      + '`phoneNumber` LIKE \'%' + phoneNumber + '%\' AND '
      + '`status` IN (' + status + ') AND '
      + '`createdDate` BETWEEN \'' + createdDateFrom + '\' AND \'' + createdDateTo + '\' '
      + 'ORDER BY `createdDate` DESC';
    const promisePool = pool.promise();
    const [transporters] = await promisePool.query(queryStr);
    res.status(200).send(transporters);
  } catch (error) {
    res.status(500).send({ error });
  }
});

router.get('/:transporterId', async (req, res) => {
  try {
    const promisePool = pool.promise();
    const [transporter] = await promisePool.query(
      'SELECT * FROM transporters WHERE `_id` = ?',
      req.params.transporterId
    );
    if (!transporter[0]) return res.status(404).send('Không tìm thấy nhà xe!');

    res.status(200).send(transporter[0]);
  } catch (error) {
    res.status(500).send({ error });
  }
});

router.post('/', auth, async (req, res) => {
  const { error } = transporterValidation(req.body);
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
    const [isPhoneNumberExist] = await promisePool.query(
      'SELECT * FROM transporters WHERE `phoneNumber` = ?',
      req.body.phoneNumber
    );
    if (isPhoneNumberExist[0])
      return res.status(400).send('Số điện thoại đã được sử dụng!');

    const transporter = {
      name: req.body.name,
      phoneNumber: req.body.phoneNumber,
    };

    const [savedTransporter] = await promisePool.query(
      'INSERT INTO transporters SET ?',
      transporter
    );
    res.status(200).send({ _id: savedTransporter.insertId });
  } catch (error) {
    res.status(500).send({ error });
  }
});

router.put('/soft-delete/:transporterId', auth, async (req, res) => {
  try {
    const promisePool = pool.promise();
    const [deletedTransporter] = await promisePool.query(
      'UPDATE transporters SET `status` = 2 WHERE `_id` = ?',
      req.params.transporterId
    );
    res.status(200).send({ matchedCount: deletedTransporter.affectedRows });
  } catch (error) {
    res.status(500).send({ error });
  }
});

router.put('/:transporterId', auth, async (req, res) => {
  const { error } = transporterValidation(req.body);
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
    const [isPhoneNumberExist] = await promisePool.query(
      'SELECT * FROM transporters WHERE `_id` != ? AND `phoneNumber` = ?',
      [req.params.transporterId, req.body.phoneNumber]
    );
    if (isPhoneNumberExist[0])
      return res.status(400).send('Số điện thoại đã được sử dụng!');

    const [updatedTransporter] = await promisePool.query(
      'UPDATE transporters SET `name` = ?, `phoneNumber` = ?, `status` = ? WHERE `_id` = ?',
      [
        req.body.name,
        req.body.phoneNumber,
        req.body.status,
        req.params.transporterId,
      ]
    );
    res.status(200).send({ matchedCount: updatedTransporter.affectedRows });
  } catch (error) {
    res.status(500).send({ error });
  }
});

router.put('/multiple/change-status', async (req, res) => {
  const transporterIds = req.body.transporterIds || [];
  const status = req.body.status;

  if (!transporterIds.length || !status)
    return res.status(400).send('Thông tin không hợp lệ!');

  try {
    const promisePool = pool.promise();
    const [updatedTransporters] = await promisePool.query(
      'UPDATE transporters SET `status` = ? WHERE `_id` IN (?)',
      [status, transporterIds]
    );

    res.status(200).send({ modifiedCount: updatedTransporters.affectedRows });
  } catch (error) {
    res.status(500).send({ error });
  }
});

module.exports = router;
