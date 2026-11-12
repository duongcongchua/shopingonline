
require('dotenv').config();

const express = require('express');
const path = require('node:path');
const fs = require('node:fs');

const connectDB = require('./utils/MongooseUtil');

const app = express();
const PORT = process.env.PORT || 3000;

// ==========================================
// MIDDLEWARE
// ==========================================

app.use(express.json({ limit: '10mb' }));

app.use(express.urlencoded({
  extended: true,
  limit: '10mb'
}));

// ==========================================
// BACKEND API
// ==========================================

app.get('/hello', (req, res) => {
  res.json({
    message: 'Hello from server!'
  });
});

app.use('/api/admin', require('./api/admin'));

app.use('/api/customer', require('./api/customer'));

// ==========================================
// REACT BUILD PATHS
// ==========================================

const adminBuild = path.resolve(
  __dirname,
  '../client-admin/build'
);

const customerBuild = path.resolve(
  __dirname,
  '../client-customer/build'
);

const adminIndex = path.join(
  adminBuild,
  'index.html'
);

const customerIndex = path.join(
  customerBuild,
  'index.html'
);

// ==========================================
// ADMIN WEBSITE
// ==========================================

if (fs.existsSync(adminIndex)) {
  app.use('/admin', express.static(adminBuild));

  app.get(
    ['/admin', '/admin/*path'],
    (req, res) => {
      res.sendFile(adminIndex);
    }
  );

  console.log('Admin React build found');
} else {
  console.warn(
    'WARNING: Admin build not found:',
    adminIndex
  );
}

// ==========================================
// CUSTOMER WEBSITE
// ==========================================

if (fs.existsSync(customerIndex)) {
  app.use(express.static(customerBuild));

  app.get('/{*path}', (req, res) => {
    res.sendFile(customerIndex);
  });

  console.log('Customer React build found');
} else {
  console.warn(
    'WARNING: Customer build not found:',
    customerIndex
  );
}

// ==========================================
// START SERVER
// ==========================================

async function startServer() {
  try {
    await connectDB();

    app.listen(PORT, '0.0.0.0', () => {
      console.log('Server listening on ' + PORT);
      console.log('MongoDB connected');

      console.log(
        'Admin build exists:',
        fs.existsSync(adminIndex)
      );

      console.log(
        'Customer build exists:',
        fs.existsSync(customerIndex)
      );
    });
  } catch (error) {
    console.error('Server startup failed:', error);
    process.exit(1);
  }
}

startServer();
