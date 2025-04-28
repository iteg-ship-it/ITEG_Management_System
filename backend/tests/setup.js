const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongo;

beforeAll(async () => {
  // Start an in-memory MongoDB server
  mongo = await MongoMemoryServer.create();
  const uri = mongo.getUri();

  // Connect Mongoose to the in-memory DB
  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

afterEach(async () => {
  // Clean up the database after each test to ensure test isolation
  const collections = await mongoose.connection.db.collections();
  for (let collection of collections) {
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  // Close the connection and stop the in-memory server
  await mongoose.connection.close();
  await mongo.stop();
});
