
require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const connectDB = require('./utils/MongooseUtil');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({
  extended: true,
  limit: '10mb'
}));

// LAB 01
app.get('/hello', (req, res) => {
  res.json({
    message: 'Hello from server!'
  });
});

// LAB 02, 03, 04 - Admin APIs
app.use(
  '/api/admin',
  require('./api/admin')
);

// LAB 05 - Customer APIs
app.use(
  '/api/customer',
  require('./api/customer')
);

// Khởi động MongoDB và Server
async function startServer() {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Server listening on ${PORT}`);
    });
  } catch (error) {
    console.error('Server startup failed:', error);
    process.exit(1);
  }
}

startServer();
