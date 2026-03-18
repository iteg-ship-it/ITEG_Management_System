const mongoose = require('mongoose');
require('dotenv').config();

const Department = require('./src/models/Department');

async function checkDepartments() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to database');

    const departments = await Department.find({});
    console.log('\nExisting departments:');
    departments.forEach(dept => {
      console.log(`- Code: ${dept.code}, Name: ${dept.name}`);
    });

    console.log(`\nTotal departments: ${departments.length}`);
    
    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkDepartments();
