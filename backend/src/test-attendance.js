import mongoose from 'mongoose'; 
import Attendance from './models/Attendance.js'; 
mongoose.connect('mongodb://127.0.0.1:27017/al_maarif_education').then(async () => { 
  const a = await Attendance.aggregate([{ $group: { _id: { date: '$dateString', status: '$status' }, count: { $sum: 1 } } }]); 
  console.log(a); 
  process.exit(0); 
});
