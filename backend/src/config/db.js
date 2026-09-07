import mongoose from "mongoose";

const connectDB = async () => {
  const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/al_maarif_education";
  
  const options = {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    family: 4
  };

  const connectWithRetry = async () => {
    try {
      await mongoose.connect(uri, options);
      console.log(`MongoDB connected: ${mongoose.connection.host}/${mongoose.connection.name}`);
    } catch (error) {
      console.error(`MongoDB connection error: ${error.message}. Retrying in 5 seconds...`);
      setTimeout(connectWithRetry, 5000);
    }
  };

  mongoose.connection.on('disconnected', () => {
    console.warn('MongoDB disconnected! Attempting to reconnect...');
  });

  mongoose.connection.on('reconnected', () => {
    console.log('MongoDB reconnected successfully!');
  });

  mongoose.connection.on('error', (err) => {
    console.error('MongoDB runtime error:', err);
  });

  await connectWithRetry();
};

export default connectDB;
