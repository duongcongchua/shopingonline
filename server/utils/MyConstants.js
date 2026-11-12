
const path = require('node:path');
require('dotenv').config({
  path: path.join(__dirname, '..', '.env')
});

const MyConstants = {
  DB_URI: process.env.MONGODB_URI,

  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES: process.env.JWT_EXPIRES || '1d',

  EMAIL_USER: process.env.EMAIL_USER,
  EMAIL_PASS: process.env.EMAIL_PASS,

  SMTP_HOST:
    process.env.SMTP_HOST || 'smtp.office365.com',

  SMTP_PORT:
    Number(process.env.SMTP_PORT || 587),

  CUSTOMER_URL:
    process.env.CUSTOMER_URL ||
    'http://localhost:3002'
};

module.exports = MyConstants;
