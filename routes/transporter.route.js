const router = require('express').Router();
const Transporter = require('../models/transporter.model');
const transporterValidation = require('../validations/transporter.validation');
const auth = require('../middleware/auth.middleware');
const moment = require('moment');

router.get('/', async (req, res) => {
  const name = req.query.name;
  const phoneNumber = req.query.phoneNumber;
  const status = req.query.status;
  const createdDateFrom = req.query.createdDateFrom;
  const createdDateTo = req.query.createdDateTo;

  try {
    const transporters = await Transporter.find(
      {
        name: { $regex: new RegExp(name, 'i') },
        phoneNumber: { $regex: new RegExp(phoneNumber) },
        createdDate: {
          $gte: createdDateFrom
            ? moment(createdDateFrom).startOf('d')
            : moment('2021-01-01').startOf('d'),
          $lte: createdDateTo
            ? moment(createdDateTo).endOf('d')
            : moment().endOf('d'),
        },
        $or: status ? [{ status }] : [{ status: 1 }, { status: 2 }],
      },
      null,
      { sort: { date: -1 } }
    );
    res.status(200).send(transporters);
  } catch (error) {
    res.status(500).send('Lỗi không xác định!');
  }
});

router.get('/:transporterId', async (req, res) => {
  try {
    const transporter = await Transporter.findById(req.params.transporterId);
    if (!transporter) return res.status(404).send('Không tìm thấy nhà xe!');

    res.status(200).send(transporter);
  } catch (error) {
    res.status(500).send('Lỗi không xác định!');
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

  const isPhoneNumberExist = await Transporter.findOne({
    phoneNumber: req.body.phoneNumber,
  });
  if (isPhoneNumberExist)
    return res.status(400).send('Số điện thoại đã được sử dụng!');

  const transporter = new Transporter({
    name: req.body.name,
    phoneNumber: req.body.phoneNumber,
  });

  try {
    const savedTransporter = await transporter.save();
    res.status(200).send(savedTransporter);
  } catch (error) {
    res.status(500).send('Lỗi không xác định!');
  }
});

router.put('/soft-delete/:transporterId', auth, async (req, res) => {
  try {
    const deletedTransporter = await Transporter.updateOne(
      {
        _id: req.params.transporterId,
      },
      {
        $set: {
          status: 2,
        },
      }
    );
    res.status(200).send(deletedTransporter);
  } catch (error) {
    res.status(500).send('Lỗi không xác định!');
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
    const isPhoneNumberExist = await Transporter.findOne({
      _id: { $ne: req.params.transporterId },
      phoneNumber: req.body.phoneNumber,
    });
    if (isPhoneNumberExist)
      return res.status(400).send('Số điện thoại đã được sử dụng!');

    const updatedTransporter = await Transporter.updateOne(
      {
        _id: req.params.transporterId,
      },
      {
        $set: {
          name: req.body.name,
          phoneNumber: req.body.phoneNumber,
          status: req.body.status,
        },
      }
    );
    res.status(200).send(updatedTransporter);
  } catch (error) {
    res.status(500).send('Lỗi không xác định!');
  }
});

router.put('/multiple/change-status', async (req, res) => {
  const transporterIds = req.body.transporterIds || [];
  const status = req.body.status;

  if (!transporterIds.length || !status)
    return res.status(400).send('Thông tin không hợp lệ!');

  try {
    const updatedTransporters = await Order.updateMany(
      { _id: { $in: transporterIds } },
      { $set: { status } }
    );

    res.status(200).send(updatedTransporters);
  } catch (error) {
    res.status(500).send({ error });
  }
});

module.exports = router;
