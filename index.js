const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

const authRoute = require('./routes/auth.route');
const transporterRoute = require('./routes/transporter.route');
const orderRoute = require('./routes/order.route');

const app = express();

app.use(cors());
app.use(express.json());

dotenv.config();

mongoose
  .connect(process.env.DB_CONNECT, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('Database connected!'))
  .catch((err) => console.log(err));

app.use('/api/auth', authRoute);
app.use('/api/transporters', transporterRoute);
app.use('/api/orders', orderRoute);

app.listen(5000, () => console.log('Server started!'));
