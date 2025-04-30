const request = require("supertest");
const mongoose = require('mongoose');

const app = require("../server");  // Import the app to test the routes
const AdmissionProcess = require("../modules/student/models/admissionProcessStudent");

const axios = require('axios');
jest.mock('axios');


const { sendEmail } = require('../utils/emailSender');
jest.mock('../utils/emailSender');
//for addAdmission Api
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

//for updateAdmissionFlag Api
describe('Admission API Tests - Interview Flag', () => {
  let student;

  beforeAll(async () => {
    // assume DB setup
  });

  beforeEach(async () => {
    await AdmissionProcess.deleteMany({});
    student = await AdmissionProcess.create({
      prkey: 'test-flag',
      firstName: 'Test',
      lastName: 'Student',
      fatherName: 'Father',
      studentMobile: '1234567890',
      parentMobile: '0987654321',
      gender: 'Male',
      dob: '2000-01-01',
      aadharCard: '123456789012',
      address: 'Test Address',
      stream: 'Sci',
      course: 'Course',
      category: 'Gen',
      subject12: 'Sub',
      year12: '2020',
      email: 'student@example.com'
    });
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it('1. should successfully update interview flag and send to central', async () => {
    axios.post.mockResolvedValue({ data: { success: true } }); // mock axios success
    sendEmail.mockResolvedValue(); // mock email success

    const res = await request(app).post(`/api/webhook/iteg-flag-update/${student._id}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Interview flag updated and sent to central');
    expect(res.body.centralResponse).toEqual({ success: true });

    const updatedStudent = await AdmissionProcess.findById(student._id);
    expect(updatedStudent.itegInterviewFlag).toBe(true);
  });

  it('2. should return 404 if student not found', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app).post(`/api/webhook/iteg-flag-update/${fakeId}`);

    expect(res.status).toBe(404);
    expect(res.body.message).toBe('Student not found');
  });

  it('3. should handle error if axios fails', async () => {
    axios.post.mockRejectedValue(new Error('Axios Error'));
    sendEmail.mockResolvedValue(); // still mock email

    const res = await request(app).post(`/api/webhook/iteg-flag-update/${student._id}`);

    expect(res.status).toBe(500);
    expect(res.body.message).toBe('Server error');
    expect(res.body.error).toMatch(/Axios Error/);
  });

  it('4. should send email if email exists', async () => {
    axios.post.mockResolvedValue({ data: { success: true } });
    const sendEmailMock = jest.spyOn(require('../utils/emailSender'), 'sendEmail').mockResolvedValue();

    await request(app).post(`/api/webhook/iteg-flag-update/${student._id}`);

    expect(sendEmailMock).toHaveBeenCalledWith(expect.objectContaining({
      to: 'student@example.com',
      subject: expect.any(String),
      text: expect.any(String),
    }));

    sendEmailMock.mockRestore();
  });

  it('5. should not fail if email is missing', async () => {
    const studentNoEmail = await AdmissionProcess.create({
      prkey: 'test-no-email',
      firstName: 'Test2',
      lastName: 'Student2',
      fatherName: 'Father2',
      studentMobile: '1234567890',
      parentMobile: '0987654321',
      gender: 'Male',
      dob: '2000-01-01',
      aadharCard: '123456789012',
      address: 'Test Address',
      stream: 'Sci',
      course: 'Course',
      category: 'Gen',
      subject12: 'Sub',
      year12: '2020',
      email: ''
    });

    axios.post.mockResolvedValue({ data: { success: true } });
    const sendEmailMock = jest.spyOn(require('../utils/emailSender'), 'sendEmail').mockResolvedValue();

    const res = await request(app).post(`/api/webhook/iteg-flag-update/${studentNoEmail._id}`);
    expect(res.status).toBe(200);

    expect(sendEmailMock).not.toHaveBeenCalled();
    sendEmailMock.mockRestore();
  });
});



