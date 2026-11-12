
const mongoose = require('mongoose');
const MyConstants = require('./MyConstants');

async function connectDB() {
  try {
    if (!MyConstants.DB_URI) {
      throw new Error('MONGODB_URI is missing');
    }

    await mongoose.connect(MyConstants.DB_URI);

    console.log('Connected to MongoDB Atlas');
  } catch (error) {
    console.error(
      'MongoDB connection error:',
      error.message
    );
    throw error;
  }
}

module.exports = connectDB;
