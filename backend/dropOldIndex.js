const mongoose = require('mongoose');
require('dotenv').config();

async function dropOldIndex() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to database');

    const db = mongoose.connection.db;
    const collection = db.collection('departments');

    // Drop the old departmentCode index
    try {
      await collection.dropIndex('departmentCode_1');
      console.log('Successfully dropped old departmentCode_1 index');
    } catch (error) {
      console.log('Index might not exist or already dropped:', error.message);
    }

    // Check remaining indexes
    const indexes = await collection.indexes();
    console.log('\nRemaining indexes:');
    indexes.forEach(index => {
      console.log(`- ${index.name}: ${JSON.stringify(index.key)}`);
    });

    await mongoose.connection.close();
    console.log('\nDone!');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

dropOldIndex();
