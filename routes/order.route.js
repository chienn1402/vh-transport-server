const router = require('express').Router();
const Order = require('../models/order.model');
const orderValidation = require('../validations/order.validation');
const auth = require('../middleware/auth.middleware');

router.get('/', async (req, res) => {
  try {
    const orders = await Order.find({});
    res.status(200).send(orders);
  } catch (error) {
    res.status(500).send('Server internal error!');
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
  });

  try {
    const savedOrder = await order.save();
    res.status(200).send(savedOrder);
  } catch (error) {
    res.status(400).send({ error });
  }
});

router.get('/find-by-transporter/:transporterPhoneNumber', async (req, res) => {
  try {
    const orders = await Order.find(
      { transporterPhoneNumber: req.params.transporterPhoneNumber },
      null,
      { sort: { date: -1 } }
    );
    res.status(200).send(orders);
  } catch (error) {
    res.status(500).send('Server internal error!');
  }
});

router.get('/find-by-recipient/:recipientPhoneNumber', async (req, res) => {
  try {
    const orders = await Order.find(
      {
        recipientPhoneNumber: req.params.recipientPhoneNumber,
      },
      null,
      { sort: { date: -1 } }
    );
    res.status(200).send(orders);
  } catch (error) {
    res.status(500).send('Server internal error!');
  }
});

router.delete('/soft-delete/:orderId', auth, async (req, res) => {
  try {
    const deletedOrder = await Order.updateOne(
      {
        _id: req.params.orderId,
      },
      {
        $set: {
          status: 0,
        },
      }
    );
    res.status(200).send(deletedOrder);
  } catch (error) {
    res.status(500).send('Server internal error!');
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
        },
      }
    );
    res.status(200).send(updatedOrder);
  } catch (error) {
    res.status(500).send('Server internal error!');
  }
});

module.exports = router;
