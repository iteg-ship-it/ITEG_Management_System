const mongoose = require('mongoose');

const MONGO_URI = "mongodb+srv://anees123:anees786786@itegmanagementsystem.qlag4.mongodb.net/itegmanagementsystem?retryWrites=true&w=majority";

async function inspect() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to DB');

  const tasks = await mongoose.connection.db.collection('tasks').find({ isActive: true }).limit(10).toArray();
  console.log('Sample Tasks (first 10):');
  tasks.forEach(t => {
    console.log(`- Title: "${t.title}", subjectId: ${t.subjectId}, subjectName: "${t.subjectName}"`);
  });

  const countWithSubjectName = await mongoose.connection.db.collection('tasks').countDocuments({ subjectName: { $exists: true, $ne: "" } });
  console.log('\nTasks with non-empty subjectName:', countWithSubjectName);

  const totalTasks = await mongoose.connection.db.collection('tasks').countDocuments({});
  console.log('Total Tasks:', totalTasks);

  await mongoose.disconnect();
}

inspect().catch(err => {
  console.error(err);
  process.exit(1);
});
