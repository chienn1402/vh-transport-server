const router = require('express').Router();
const Transporter = require('../models/transporter.model');
const transporterValidation = require('../validations/transporter.validation');
const auth = require('../middleware/auth.middleware');
const moment = require('moment');

router.get('/', async (req, res) => {
  const name = req.query.name;
  const phoneNumber = req.query.phoneNumber;
  const status = req.query.status === '0' ? 0 : 1;
  const createdDateFrom = req.query.createdDateFrom;
  const createdDateTo = req.query.createdDateTo;

  try {
    const transporters = await Transporter.find({
      name: { $regex: new RegExp(name) },
      phoneNumber: { $regex: new RegExp(phoneNumber) },
      status: status,
      createdDate: {
        $gte: createdDateFrom
          ? moment(createdDateFrom).startOf('d')
          : moment(process.env.EARLIEST_DATE_STR).startOf('d'),
        $lte: createdDateTo
          ? moment(createdDateTo).endOf('d')
          : moment().endOf('d'),
      },
    });
    res.status(200).send(transporters);
  } catch (error) {
    res.status(500).send('Internal server error!');
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
          : 'Invalid data!'
      );

  const isPhoneNumberExist = await Transporter.findOne({
    phoneNumber: req.body.phoneNumber,
  });
  if (isPhoneNumberExist)
    return res.status(400).send('Phone number already exists!');

  const transporter = new Transporter({
    name: req.body.name,
    phoneNumber: req.body.phoneNumber,
  });

  try {
    const savedTransporter = await transporter.save();
    res.status(200).send(savedTransporter);
  } catch (error) {
    res.status(500).send('Internal server error!');
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
          status: 0,
        },
      }
    );
    res.status(200).send(deletedTransporter);
  } catch (error) {
    res.status(500).send('Internal server error!');
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
          : 'Invalid data!'
      );

  try {
    const updatedTransporter = await Transporter.updateOne(
      {
        _id: req.params.transporterId,
      },
      {
        $set: {
          name: req.body.name,
          phoneNumber: req.body.phoneNumber,
        },
      }
    );
    res.status(200).send(updatedTransporter);
  } catch (error) {
    res.status(500).send('Internal server error!');
  }
});

module.exports = router;
