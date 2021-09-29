const router = require('express').Router();
const orderValidation = require('../validations/order.validation');
const auth = require('../middleware/auth.middleware');
const moment = require('moment');
const pool = require('../db');
const { DATE_TIME_FORMAT, EARLIEST_DATE } = require('../config');

router.get('/', async (req, res) => {
  const transporterName = req.query.transporterName || '';
  const transporterTel = req.query.transporterTel || '';
  const receiverName = req.query.receiverName || '';
  const receiverTel = req.query.receiverTel || '';
  const status = req.query.status || '1,2,3';
  const createdDateFrom = req.query.createdDateFrom
    ? moment(req.query.createdDateFrom).startOf('d').format(DATE_TIME_FORMAT)
    : moment(EARLIEST_DATE).startOf('d').format(DATE_TIME_FORMAT);
  const createdDateTo = req.query.createdDateTo
    ? moment(req.query.createdDateTo).endOf('d').format(DATE_TIME_FORMAT)
    : moment().endOf('d').format(DATE_TIME_FORMAT);

  try {
    const queryStr =
      'SELECT * FROM orders WHERE ' +
      "UPPER(`transporterName`) LIKE UPPER('%" +
      transporterName +
      "%') AND " +
      "`transporterTel` LIKE '%" +
      transporterTel +
      "%' AND " +
      "UPPER(`receiverName`) LIKE UPPER('%" +
      receiverName +
      "%') AND " +
      "`receiverTel` LIKE '%" +
      receiverTel +
      "%' AND " +
      '`status` IN (' +
      status +
      ') AND ' +
      "`createdDate` BETWEEN '" +
      createdDateFrom +
      "' AND '" +
      createdDateTo +
      "' " +
      'ORDER BY `createdDate` DESC';
    const promisePool = pool.promise();
    const [orders] = await promisePool.query(queryStr);
    res.status(200).send(orders);
  } catch (error) {
    res.status(500).send({ error });
  }
});

router.get('/:orderId', async (req, res) => {
  try {
    const promisePool = pool.promise();
    const [order] = await promisePool.query(
      'SELECT * FROM orders WHERE `_id` = ?',
      req.params.orderId
    );
    if (!order[0]) return res.status(404).send('Không tìm thấy đơn hàng!');

    res.status(200).send(order[0]);
  } catch (error) {
    res.status(500).send({ error });
  }
});

router.post('/', auth, async (req, res) => {
  const { error } = orderValidation(req.body);
  if (error)
    return res
      .status(400)
      .send(
        error.details && error.details.length
          ? error.details[0].message
          : 'Thông tin không hợp lệ!'
      );

  const order = {
    transporterName: req.body.transporterName,
    transporterTel: req.body.transporterTel,
    receiverName: req.body.receiverName,
    receiverTel: req.body.receiverTel,
    receivePlace: req.body.receivePlace,
    goods: req.body.goods,
    transFee: req.body.transFee,
    codFee: req.body.codFee,
    totalFee: (req.body.transFee || 0) + (req.body.codFee || 0),
  };

  try {
    const promisePool = pool.promise();
    const [savedOrder] = await promisePool.query(
      'INSERT INTO orders SET ?',
      order
    );
    res.status(200).send({ _id: savedOrder.insertId });
  } catch (error) {
    res.status(400).send({ error });
  }
});

router.get('/find-by-transporter/:transporterTel', async (req, res) => {
  const createdDateFrom = req.query.createdDateFrom
    ? moment(req.query.createdDateFrom).startOf('d').format(DATE_TIME_FORMAT)
    : moment(EARLIEST_DATE).startOf('d').format(DATE_TIME_FORMAT);
  const createdDateTo = req.query.createdDateTo
    ? moment(req.query.createdDateTo).endOf('d').format(DATE_TIME_FORMAT)
    : moment().endOf('d').format(DATE_TIME_FORMAT);

  try {
    const promisePool = pool.promise();
    const queryFindTransporterByPhoneNumber =
      'SELECT * FROM transporters WHERE `phoneNumber` = ?';
    const queryFindOrderByTransporterTel =
      'SELECT * FROM orders WHERE `transporterTel` = ? AND ' +
      "`createdDate` BETWEEN '" +
      createdDateFrom +
      "' AND '" +
      createdDateTo +
      "' " +
      'ORDER BY `createdDate` DESC';
    const [[transporter], [orders]] = await Promise.all([
      promisePool.query(
        queryFindTransporterByPhoneNumber,
        req.params.transporterTel
      ),
      promisePool.query(
        queryFindOrderByTransporterTel,
        req.params.transporterTel
      ),
    ]);
    res.status(200).send({
      transporter,
      orders,
    });
  } catch (error) {
    res.status(500).send({ error });
  }
});

router.get('/find-by-recipient/:receiverTel', async (req, res) => {
  const createdDateFrom = req.query.createdDateFrom
    ? moment(req.query.createdDateFrom).startOf('d').format(DATE_TIME_FORMAT)
    : moment(EARLIEST_DATE).startOf('d').format(DATE_TIME_FORMAT);
  const createdDateTo = req.query.createdDateTo
    ? moment(req.query.createdDateTo).endOf('d').format(DATE_TIME_FORMAT)
    : moment().endOf('d').format(DATE_TIME_FORMAT);

  try {
    const queryFindOrderByReceiverTel =
      'SELECT * FROM orders WHERE `receiverTel` = ? AND ' +
      "`createdDate` BETWEEN '" +
      createdDateFrom +
      "' AND '" +
      createdDateTo +
      "' " +
      'ORDER BY `createdDate` DESC';
    const promisePool = pool.promise();
    const [orders] = await promisePool.query(
      queryFindOrderByReceiverTel,
      req.params.receiverTel
    );
    res.status(200).send(orders);
  } catch (error) {
    res.status(500).send({ error });
  }
});

router.put('/soft-delete/:orderId', auth, async (req, res) => {
  try {
    const promisePool = pool.promise();
    const [deletedOrder] = await promisePool.query(
      'UPDATE orders SET `status` = 2 WHERE `_id` = ?',
      req.params.orderId
    );
    res.status(200).send({ matchedCount: deletedOrder.affectedRows });
  } catch (error) {
    res.status(500).send({ error });
  }
});

router.put('/:orderId', auth, async (req, res) => {
  const { error } = orderValidation(req.body);
  if (error)
    return res
      .status(400)
      .send(
        error.details && error.details.length
          ? error.details[0].message
          : 'Thông tin không hợp lệ!'
      );

  const order = {
    transporterName: req.body.transporterName,
    transporterTel: req.body.transporterTel,
    receiverName: req.body.receiverName,
    receiverTel: req.body.receiverTel,
    receivePlace: req.body.receivePlace,
    goods: req.body.goods,
    transFee: req.body.transFee,
    codFee: req.body.codFee,
    totalFee: (req.body.transFee || 0) + (req.body.codFee || 0),
    status: req.body.status,
  };

  try {
    const promisePool = pool.promise();
    const [updatedOrder] = await promisePool.query(
      'UPDATE orders SET ? WHERE `_id` = ?',
      [order, req.params.orderId]
    );
    res.status(200).send({ matchedCount: updatedOrder.affectedRows });
  } catch (error) {
    console.log(error);
    res.status(500).send({ error });
  }
});

router.put('/multiple/change-status', auth, async (req, res) => {
  const orderIds = req.body.orderIds || [];
  const status = req.body.status;

  if (!orderIds.length || !status)
    return res.status(400).send('Thông tin không hợp lệ!');

  try {
    const promisePool = pool.promise();
    const [updatedOrders] = await promisePool.query(
      'UPDATE orders SET `status` = ? WHERE `_id` IN (?)',
      [status, orderIds]
    );

    res.status(200).send({ modifiedCount: updatedOrders.affectedRows });
  } catch (error) {
    res.status(500).send({ error });
  }
});

module.exports = router;
