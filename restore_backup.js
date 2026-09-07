const fs = require('fs');
const path = require('path');
const mongoose = require(path.join(__dirname, 'backend', 'node_modules', 'mongoose'));
const dotenv = require(path.join(__dirname, 'backend', 'node_modules', 'dotenv'));

// Read .env from the backend folder
dotenv.config({ path: path.join(__dirname, 'backend', '.env') });

// Use MONGO_URI from .env, or a local default if not set
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/al_maarif_education';

async function restore() {
  try {
    const backupPath = path.join(__dirname, 'database_backup.json');
    console.log(`Reading backup file from ${backupPath}...`);
    
    if (!fs.existsSync(backupPath)) {
      console.error(`Backup file not found at ${backupPath}`);
      process.exit(1);
    }

    const fileContent = fs.readFileSync(backupPath, 'utf8');
    const backupData = JSON.parse(fileContent);
    
    console.log(`Connecting to database at ${MONGO_URI}...`);
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB!");
    
    const db = mongoose.connection.db;
    
    for (const [colName, data] of Object.entries(backupData)) {
      console.log(`Restoring collection: ${colName} (${data.length} documents)`);
      if (data.length > 0) {
        // Drop existing collection if it exists to avoid duplicate key errors
        try {
          await db.collection(colName).drop();
        } catch (e) {
          // Ignore error if collection doesn't exist
        }
        await db.collection(colName).insertMany(data);
      }
    }
    
    console.log("Restore completed successfully!");
    process.exit(0);
  } catch (err) {
    console.error("Restore failed:", err);
    process.exit(1);
  }
}

restore();
