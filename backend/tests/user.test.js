const request = require('supertest');
const app = require('../server'); // your Express app
const mongoose = require('mongoose');
const User = require('../modules/user/models/user');
const bcrypt = require('bcryptjs');
const { MongoMemoryServer } = require('mongodb-memory-server');

beforeEach(async () => {
  user = await User.create({
    name: 'Test User',
    email: `testuser${Date.now()}@example.com`,
    mobileNo: '9876543210', 
    password: 'hashedpassword',
    adharCard: `${Math.floor(Math.random() * 1000000000000)}`,
    department: 'IT',
    position: 'Developer',
    role: 'admin',
    isActive: true,
  });
});
  
 
beforeAll(async () => {
    // assume in-memory DB configured in setup.js
  });


  // After all tests, disconnect
  afterAll(async () => {
    await mongoose.connection.close();
  });

  // After each test, clear users
  afterEach(async () => {
    await User.deleteMany({});
  });
  describe('User API - Create User', () => {

    it("1 should create a new user successfully", async () => {
      const payload = {
        name: "Test User",
        email: "TEST@EMAIL.COM",
        mobileNo: "9876543210", // ✅ must match schema key
        password: "securepass123",
        adharCard: "123456789012",
        department: "IT",
        position: "Manager",
        role: "admin"
      };
  
      console.log("🔍 Sending test payload:", payload);
  
      const res = await request(app)
        .post("/api/user/create") // 👈 match your route
        .send(payload)
        .expect(201);
  
      expect(res.body.message).toMatch(/created successfully/i);
    });
  

    it("2 should reject user with duplicate email or Aadhar", async () => {
      const duplicateUser = {
        name: "Duplicate User",
        email: user.email, // existing user's email
        mobileNo: "9876543211",
        password: "pass123",
        adharCard: user.adharCard, // existing user's Aadhar
        department: "IT",
        position: "Manager",
        role: "admin"
      };
    
      const res = await request(app)
        .post("/api/user/create")
        .send(duplicateUser)
        .expect(400);
    
      expect(res.body.message).toMatch(/already exists/i);
    });
    
    
    it("3 should reject user with invalid role", async () => {
      const payload = {
        name: "Invalid Role User",
        email: `invalidrole${Date.now()}@example.com`,
        mobileNo: "9876543212",
        password: "pass123",
        adharCard: `${Date.now()}1234`,
        department: "HR",
        position: "Lead",
        role: "student" // ❌ Not allowed
      };
    
      const res = await request(app)
        .post("/api/user/create")
        .send(payload)
        .expect(400);
    
      expect(res.body.message).toMatch(/invalid role/i);
    });
    
  
    it("4 should save email in lowercase", async () => {
      const email = "MIXEDCASE@Example.COM";
      const payload = {
        name: "Lowercase Email",
        email,
        mobileNo: "9876543213",
        password: "pass123",
        adharCard: `${Date.now()}5678`,
        department: "Finance",
        position: "Executive",
        role: "faculty"
      };
    
      const res = await request(app)
        .post("/api/user/create")
        .send(payload)
        .expect(201);
    
      expect(res.body.user.email).toBe(email.toLowerCase());
    });
    
    it("should reject if required fields are missing", async () => {
      const payload = {
        email: "missingfields@example.com",
        mobileNo: "9876543214",
        // Missing name, adharCard, password, department, position, role
      };
    
      const res = await request(app)
        .post("/api/user/create")
        .send(payload)
        .expect(400); // ✅ Changed from 500 to 400
    
      expect(res.body.message).toMatch(/required/i); // Optional: improve if your error message changes
    });
    
    
  

  // login tests
//   it('1 should login successfully with valid credentials', async () => {
//     // First, create a user
//     const user = await User.create({
//       name: 'Test User',
//       email: 'test@example.com',
//       password: await bcrypt.hash('Password123', 10),
//       adharCard: '123456789012',
//       department: 'IT',
//       position: 'Developer',
//       role: 'admin'
//     });
  
//     const res = await request(app)
//       .post('/api/user/login')
//       .send({
//         email: 'test@example.com',
//         password: 'Password123'
//       });
  
//     expect(res.statusCode).toBe(200);
//     expect(res.body).toHaveProperty('message', 'Login successful');
//     expect(res.body).toHaveProperty('token');
//     expect(res.body).toHaveProperty('refreshToken');
//     expect(res.body.user).toHaveProperty('email', 'test@example.com');
//   });
 
//   it('2 should fail if email does not exist', async () => {
//     const res = await request(app)
//       .post('/api/user/login')
//       .send({
//         email: 'nonexistent@example.com',
//         password: 'Password123'
//       });
  
//     expect(res.statusCode).toBe(401);
//     expect(res.body).toHaveProperty('message', 'Invalid email or password');
//   });
//   it('3 should fail if password is incorrect', async () => {
//     // First, create a user
//     const user = await User.create({
//       name: 'Test User',
//       email: 'test@example.com',
//       password: await bcrypt.hash('Password123', 10),
//       adharCard: '123456789012',
//       department: 'IT',
//       position: 'Developer',
//       role: 'admin'
//     });
  
//     const res = await request(app)
//       .post('/api/user/login')
//       .send({
//         email: 'test@example.com',
//         password: 'WrongPassword'
//       });
  
//     expect(res.statusCode).toBe(401);
//     expect(res.body).toHaveProperty('message', 'Invalid email or password');
//   });
  
//   it('4 should fail if email is missing', async () => {
//     const res = await request(app)
//       .post('/api/user/login')
//       .send({
//         password: 'Password123'
//       });
  
//     expect(res.statusCode).toBe(400); // Optional: if you handle missing fields
//     // or if you don't handle, expect 500
//   });


//   it('5 should fail if password is missing', async () => {
//     const res = await request(app)
//       .post('/api/user/login')
//       .send({
//         email: 'test@example.com'
//       });
  
//     expect(res.statusCode).toBe(400); // Again, if validation is added
//   });

// // Update

// it('1 should update the user\'s position successfully', async () => {
//   const res = await request(app)
//     .patch(`/api/user/update/${user._id}`)
//     .send({ position: 'Senior Developer' });

//   expect(res.statusCode).toBe(200);
//   expect(res.body.success).toBe(true);
//   expect(res.body.user.position).toBe('Senior Developer');
// });

// it('2 should update multiple fields successfully', async () => {
//   const res = await request(app)
//     .patch(`/api/user/update/${user._id}`)
//     .send({
//       position: 'Team Lead',
//       department: 'Engineering',
//       role: 'faculty',
//       isActive: false,
//     });

//   expect(res.statusCode).toBe(200);
//   expect(res.body.user.position).toBe('Team Lead');
//   expect(res.body.user.department).toBe('Engineering');
//   expect(res.body.user.role).toBe('faculty');
//   expect(res.body.user.isActive).toBe(false);
// });
  

// it('3 should return 404 if ID is invalid', async () => {
//   const invalidId = '12345';

//   const res = await request(app)
//     .patch(`/api/user/update/${invalidId}`)
//     .send({ position: 'Senior Developer' });

//   expect(res.statusCode).toBe(404);
//   expect(res.body.message).toBe('User not found');
// });


// it('4 should return 404 if user does not exist', async () => {
//   const validNonExistentId = new mongoose.Types.ObjectId();

//   const res = await request(app)
//     .patch(`/api/user/update/${validNonExistentId}`)
//     .send({ position: 'Senior Developer' });

//   expect(res.statusCode).toBe(404);
//   expect(res.body.message).toBe('User not found');
// });

// it('5 should return 200 even if no fields are updated (optional behavior)', async () => {
//   const res = await request(app)
//     .patch(`/api/user/update/${user._id}`)
//     .send({});

//   expect(res.statusCode).toBe(200);
//   expect(res.body.success).toBe(true);
//   expect(res.body.message).toBe('User updated successfully');
// });

});
