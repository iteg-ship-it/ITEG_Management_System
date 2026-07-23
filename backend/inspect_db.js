const mongoose = require('mongoose');

const MONGO_URI = "mongodb+srv://anees123:anees786786@itegmanagementsystem.qlag4.mongodb.net/itegmanagementsystem?retryWrites=true&w=majority";

async function inspect() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to DB');

  const studentTasks = await mongoose.connection.db.collection('studenttasks').find({ isActive: true }).limit(30).toArray();
  console.log(`Found ${studentTasks.length} student tasks sample:`);

  studentTasks.forEach((st, idx) => {
    console.log(`${idx + 1}. StudentID: ${st.studentId}, Title: "${st.title}"`);
    console.log(`   subjectId: ${st.subjectId} (${typeof st.subjectId})`);
    console.log(`   subjectName: "${st.subjectName}"`);
  });

  const uniqueSubjectNames = await mongoose.connection.db.collection('studenttasks').distinct('subjectName');
  console.log('\nUnique subject names in studenttasks:', uniqueSubjectNames);

  await mongoose.disconnect();
}

inspect().catch(err => {
  console.error(err);
  process.exit(1);
});
