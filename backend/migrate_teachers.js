import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, ".env") });

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB.");

    const db = mongoose.connection.db;
    const teachers = await db.collection('teachers').find().toArray();
    
    const subjects = await db.collection('subjects').find().toArray();
    let subjectUpdates = 0;
    
    for (let subject of subjects) {
      if (typeof subject.teacher === 'string') {
        const name = subject.teacher.toLowerCase();
        let matchedTeacher = null;
        
        if (name.includes('kafia')) {
          matchedTeacher = teachers.find(t => t.name.toLowerCase().includes('kafia'));
        } else if (name.includes('gulalai') || name.includes('gualalai')) {
          matchedTeacher = teachers.find(t => t.name.toLowerCase().includes('gulalai'));
        } else if (name.includes('aisha')) {
          matchedTeacher = teachers.find(t => t.name.toLowerCase().includes('aisha'));
        }
        
        if (matchedTeacher) {
          await db.collection('subjects').updateOne(
            { _id: subject._id }, 
            { $set: { teacher: matchedTeacher._id } }
          );
        } else {
          await db.collection('subjects').updateOne(
            { _id: subject._id }, 
            { $set: { teacher: null } }
          );
        }
        subjectUpdates++;
      }
    }
    console.log(`Migrated ${subjectUpdates} subjects.`);

    const timetables = await db.collection('timetables').find().toArray();
    let timetableUpdates = 0;
    
    for (let tt of timetables) {
      if (typeof tt.teacher === 'string') {
        const name = tt.teacher.toLowerCase();
        let matchedTeacher = null;
        
        if (name.includes('kafia')) {
          matchedTeacher = teachers.find(t => t.name.toLowerCase().includes('kafia'));
        } else if (name.includes('gulalai') || name.includes('gualalai')) {
          matchedTeacher = teachers.find(t => t.name.toLowerCase().includes('gulalai'));
        } else if (name.includes('aisha')) {
          matchedTeacher = teachers.find(t => t.name.toLowerCase().includes('aisha'));
        }
        
        if (matchedTeacher) {
          await db.collection('timetables').updateOne(
            { _id: tt._id }, 
            { $set: { teacher: matchedTeacher._id } }
          );
        } else {
          // Required field in timetable, fallback to first teacher if missing
          await db.collection('timetables').updateOne(
            { _id: tt._id }, 
            { $set: { teacher: teachers[0]?._id || null } }
          );
        }
        timetableUpdates++;
      }
    }
    console.log(`Migrated ${timetableUpdates} timetables.`);
    
    console.log("Migration complete.");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

run();
