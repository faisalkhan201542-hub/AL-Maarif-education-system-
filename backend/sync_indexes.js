import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load env vars
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '.env') });

// Import models
import Attendance from './src/models/Attendance.js';
import FeeChallan from './src/models/FeeChallan.js';
import Subject from './src/models/Subject.js';
import Timetable from './src/models/Timetable.js';
import Student from './src/models/Student.js';
import Result from './src/models/Result.js';

const syncIndexes = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected successfully.');

    console.log('Running pre-sync migrations...');
    // 1. Backfill dateString in Attendance
    const attendances = await Attendance.find({ dateString: { $exists: false } });
    console.log(`Found ${attendances.length} attendances missing dateString.`);
    let migratedCount = 0;
    for (const att of attendances) {
      if (att.date) {
        const dateString = new Date(att.date).toISOString().split('T')[0];
        await Attendance.collection.updateOne({ _id: att._id }, { $set: { dateString } });
        migratedCount++;
      }
    }
    console.log(`Successfully migrated ${migratedCount} attendances.`);

    // 2. Drop old overlapping/conflicting indexes explicitly to be safe
    try {
      await Attendance.collection.dropIndex("student_1_date_1");
    } catch(e) {}
    try {
      await Student.collection.dropIndex("class_1_rollNumber_1");
    } catch(e) {}
    try {
      await Timetable.collection.dropIndex("class_1_day_1_periodNumber_1_teacher_1");
    } catch(e) {}

    const models = [Attendance, FeeChallan, Subject, Timetable, Student, Result];

    for (const model of models) {
      console.log(`Syncing indexes for ${model.modelName}...`);
      await model.syncIndexes();
      console.log(`Indexes synced for ${model.modelName}.`);
    }

    console.log('All indexes synchronized successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Error synchronizing indexes:', error);
    process.exit(1);
  }
};

syncIndexes();
