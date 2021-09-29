const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');

const authRoute = require('./routes/auth.route');
const transporterRoute = require('./routes/transporter.route');
const orderRoute = require('./routes/order.route');

const app = express();

app.use(cors());
app.use(express.json());

dotenv.config();

app.use('/api/auth', authRoute);
app.use('/api/transporters', transporterRoute);
app.use('/api/orders', orderRoute);

app.listen(5000, () => console.log('Server started!'));
