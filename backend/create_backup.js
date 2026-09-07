import fs from 'fs/promises';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

async function backup() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB for backup...");
    
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    
    const backupData = {};
    for (const collection of collections) {
      const colName = collection.name;
      console.log(`Dumping collection: ${colName}`);
      const data = await db.collection(colName).find({}).toArray();
      backupData[colName] = data;
    }
    
    const outputPath = path.resolve('../database_backup.json');
    await fs.writeFile(outputPath, JSON.stringify(backupData, null, 2));
    
    console.log(`Backup completed successfully! Saved to: ${outputPath}`);
    process.exit(0);
  } catch (err) {
    console.error("Backup failed:", err);
    process.exit(1);
  }
}

backup();
