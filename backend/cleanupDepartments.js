const mongoose = require('mongoose');
require('dotenv').config();

const Department = require('./src/models/Department');

async function cleanupDepartments() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to database');

    // Delete departments with undefined code
    const result = await Department.deleteMany({ 
      $or: [
        { code: { $exists: false } },
        { code: null },
        { code: undefined }
      ]
    });

    console.log(`Deleted ${result.deletedCount} invalid departments`);

    const remaining = await Department.find({});
    console.log('\nRemaining departments:');
    remaining.forEach(dept => {
      console.log(`- Code: ${dept.code}, Name: ${dept.name}`);
    });

    await mongoose.connection.close();
    console.log('\nCleanup completed!');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

cleanupDepartments();
