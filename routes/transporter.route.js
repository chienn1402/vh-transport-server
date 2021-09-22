const router = require('express').Router();
const Transporter = require('../models/transporter.model');
const transporterValidation = require('../validations/transporter.validation');
const auth = require('../middleware/auth.middleware');

router.get('/', async (req, res) => {
  try {
    const transporters = await Transporter.find();
    res.status(200).send(transporters);
  } catch (error) {
    res.status(500).send('Server internal error!');
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
    res.status(500).send('Server internal error!');
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
    res.status(500).send('Server internal error!');
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
    res.status(500).send('Server internal error!');
  }
});

module.exports = router;
