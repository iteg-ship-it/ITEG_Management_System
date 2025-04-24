const request = require("supertest");
const mongoose = require('mongoose');

const app = require("../server");  // Import the app to test the routes
const AdmissionProcess = require("../modules/student/models/admissionProcessStudent");

describe('Admission API Tests', () => {
    beforeAll(async () => {
      // assume in-memory DB configured in setup.js
    });
  
    beforeEach(async () => {
      await AdmissionProcess.deleteMany({});
    });
  
    afterAll(async () => {
      await mongoose.connection.close();
    });
  
    it('1. should create a new admission with valid data', async () => {
      const payload = {
        prkey: 'test1', firstName: 'A', lastName: 'B', fatherName: 'C',
        studentMobile: '1234567890', parentMobile: '0987654321', gender: 'Male',
        dob: '2000-01-01', aadharCard: '123456789012', address: 'Addr',
        stream: 'Sci', course: 'Course', category: 'Gen', subject12: 'Sub', year12: '2020'
      };
      const res = await request(app).post('/api/webhook/receive/data').send(payload);
      expect(res.status).toBe(201);
      expect(res.body.message).toBe('Student admission initiated');
      expect(res.body.data).toHaveProperty('_id');
    });
  
    it('2. should fail when a required field is missing', async () => {
      const payload = { prkey: 'test2' }; // missing others
      const res = await request(app).post('/api/webhook/receive/data').send(payload);
      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/^Missing field:/);
    });
  
    it('3. should fail on invalid dob format', async () => {
      const payload = {
        prkey: 'test3', firstName: 'A', lastName: 'B', fatherName: 'C',
        studentMobile: '1234567890', parentMobile: '0987654321', gender: 'Male',
        dob: 'invalid-date', aadharCard: '123456789012', address: 'Addr',
        stream: 'Sci', course: 'Course', category: 'Gen', subject12: 'Sub', year12: '2020'
      };
      const res = await request(app).post('/api/webhook/receive/data').send(payload);
      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Invalid date format');
    });
  
    it('4. should fail on invalid mobile or aadhar format', async () => {
      const payload = {
        prkey: 'test4', firstName: 'A', lastName: 'B', fatherName: 'C',
        studentMobile: '12345', parentMobile: '0987654321', gender: 'Male',
        dob: '2000-01-01', aadharCard: 'invalid', address: 'Addr',
        stream: 'Sci', course: 'Course', category: 'Gen', subject12: 'Sub', year12: '2020'
      };
      const res = await request(app).post('/api/webhook/receive/data').send(payload);
      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Invalid mobile number format');
    });
  
    it('5. should detect duplicate prkey and return 200', async () => {
      const payload = {
        prkey: 'test5', firstName: 'A', lastName: 'B', fatherName: 'C',
        studentMobile: '1234567890', parentMobile: '0987654321', gender: 'Male',
        dob: '2000-01-01', aadharCard: '123456789012', address: 'Addr',
        stream: 'Sci', course: 'Course', category: 'Gen', subject12: 'Sub', year12: '2020'
      };
      // first request
      await request(app).post('/api/webhook/receive/data').send(payload);
      // duplicate request
      const res = await request(app).post('/api/webhook/receive/data').send(payload);
      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Student already registered');
    });
  });
