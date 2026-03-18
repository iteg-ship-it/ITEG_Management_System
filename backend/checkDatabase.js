const mongoose = require('mongoose');
require('dotenv').config();

async function checkDatabase() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to database');

    const db = mongoose.connection.db;
    const collection = db.collection('departments');

    // Get all documents
    const allDocs = await collection.find({}).toArray();
    console.log('\nAll documents in departments collection:');
    console.log(JSON.stringify(allDocs, null, 2));

    // Get indexes
    const indexes = await collection.indexes();
    console.log('\nIndexes:');
    console.log(JSON.stringify(indexes, null, 2));

    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkDatabase();
