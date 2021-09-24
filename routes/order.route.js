const router = require('express').Router();
const Order = require('../models/order.model');
const Transporter = require('../models/transporter.model');
const orderValidation = require('../validations/order.validation');
const auth = require('../middleware/auth.middleware');
const moment = require('moment');

router.get('/', async (req, res) => {
  const transporterName = req.query.transporterName;
  const transporterTel = req.query.transporterTel;
  const receiverName = req.query.receiverName;
  const receiverTel = req.query.receiverTel;
  const status = req.query.status;
  const createdDateFrom = req.query.createdDateFrom;
  const createdDateTo = req.query.createdDateTo;

  try {
    const orders = await Order.find({
      transporterName: { $regex: new RegExp(transporterName, 'i') },
      transporterTel: { $regex: new RegExp(transporterTel) },
      receiverName: { $regex: new RegExp(receiverName, 'i') },
      receiverTel: { $regex: new RegExp(receiverTel) },
      createdDate: {
        $gte: createdDateFrom
          ? moment(createdDateFrom).startOf('d')
          : moment('2021-01-01').startOf('d'),
        $lte: createdDateTo
          ? moment(createdDateTo).endOf('d')
          : moment().endOf('d'),
      },
      $or: status
        ? [{ status }]
        : [{ status: 1 }, { status: 2 }, { status: 3 }],
    });
    res.status(200).send(orders);
  } catch (error) {
    res.status(500).send('Internal server error!');
  }
});

router.get('/:orderId', async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) return res.status(404).send('Order not found!');

    res.status(200).send(order);
  } catch (error) {
    res.status(500).send('Internal server error!');
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
          : 'Invalid data!'
      );

  const order = new Order({
    transporterName: req.body.transporterName,
    transporterTel: req.body.transporterTel,
    receiverName: req.body.receiverName,
    receiverTel: req.body.receiverTel,
    receivePlace: req.body.receivePlace,
    goods: req.body.goods,
    transFee: req.body.transFee,
    codFee: req.body.codFee,
    totalFee: (req.body.transFee || 0) + (req.body.codFee || 0),
  });

  try {
    const savedOrder = await order.save();
    res.status(200).send(savedOrder);
  } catch (error) {
    res.status(400).send({ error });
  }
});

router.get('/find-by-transporter/:transporterTel', async (req, res) => {
  try {
    const [transporter, orders] = await Promise.all([
      Transporter.findOne({ phoneNumber: req.params.transporterTel }),
      Order.find(
        {
          transporterTel: req.params.transporterTel,
          $or: [{ status: 1 }, { status: 2 }],
        },
        null,
        { sort: { date: -1 } }
      ),
    ]);
    res.status(200).send({
      transporter,
      orders,
    });
  } catch (error) {
    res.status(500).send('Internal server error!');
  }
});

router.get('/find-by-recipient/:receiverTel', async (req, res) => {
  try {
    const orders = await Order.find(
      {
        receiverTel: req.params.receiverTel,
        $or: [{ status: 1 }, { status: 2 }],
      },
      null,
      { sort: { date: -1 } }
    );
    res.status(200).send(orders);
  } catch (error) {
    res.status(500).send('Internal server error!');
  }
});

router.put('/soft-delete/:orderId', auth, async (req, res) => {
  try {
    const deletedOrder = await Order.updateOne(
      {
        _id: req.params.orderId,
      },
      {
        $set: {
          status: 3,
        },
      }
    );
    res.status(200).send(deletedOrder);
  } catch (error) {
    res.status(500).send('Internal server error!');
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
          : 'Invalid data!'
      );

  try {
    const updatedOrder = await Order.updateOne(
      {
        _id: req.params.orderId,
      },
      {
        $set: {
          transporterName: req.body.transporterName,
          transporterTel: req.body.transporterTel,
          receiverName: req.body.receiverName,
          receiverTel: req.body.receiverTel,
          receivePlace: req.body.receivePlace,
          goods: req.body.goods,
          transFee: req.body.transFee,
          codFee: req.body.codFee,
          status: req.body.status,
        },
      }
    );
    res.status(200).send(updatedOrder);
  } catch (error) {
    res.status(500).send('Internal server error!');
  }
});

module.exports = router;
