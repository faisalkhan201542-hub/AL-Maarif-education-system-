import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

async function checkIndexes() {
  await mongoose.connect(process.env.MONGO_URI);
  const indexes = await mongoose.connection.collection("timetables").indexes();
  console.log(indexes);
  mongoose.disconnect();
}
checkIndexes();
