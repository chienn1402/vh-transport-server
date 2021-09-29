const mysql = require('mysql2');

module.exports = mysql.createPool({
  host: '103.130.216.70',
  user: 'vantaivi_admin',
  password: 'hoanganhcv1',
  database: 'vantaivi_transport_db'
});
