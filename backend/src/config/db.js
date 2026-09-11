import mongoose from "mongoose";

const connectDB = async () => {
  const isProduction = process.env.NODE_ENV === 'production';
  let uri = process.env.MONGO_URI;
  
  if (isProduction || (uri && !uri.startsWith("mongodb://") && !uri.startsWith("mongodb+srv://"))) {
    // The password "Maarif@123" must be URL encoded because "@" is a reserved character. "@" becomes "%40"
    uri = "mongodb+srv://schooladmin123:Maarif%40123@cluster0.faevmkq.mongodb.net/al_maarif_education?retryWrites=true&w=majority&appName=Cluster0";
  } else {
    // Local development fallback
    uri = uri || "mongodb://127.0.0.1:27017/al_maarif_education";
  }
  
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
