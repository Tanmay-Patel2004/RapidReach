const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect('mongodb://127.0.0.1:27017/rapidReachDB', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

    // Test the connection
    const collections = await conn.connection.db.listCollections().toArray();
    console.log('📚 Available collections:', collections.map(c => c.name));

  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;  


//mongodb://admin:admin123@localhost:27017/rapidReachDB?authSource=admin