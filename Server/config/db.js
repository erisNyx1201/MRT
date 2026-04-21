/*************************
 * Database Configuration
 * 
 * This module connects to the MongoDB database using Mongoose.
 * It logs the connection status using a custom logger.
 *************************/

const mongoose = require("mongoose");
const { dbLogger } = require('../modules/logger');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
    });
    dbLogger.info("✅ MongoDB Connected");
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error);
    dbLogger.error("❌ MongoDB Error:", error);
    process.exit(1);
  }
};

module.exports = connectDB;