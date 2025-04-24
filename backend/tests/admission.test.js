const request = require("supertest");
const app = require("../server");  // Import the app to test the routes

describe("POST /api/webhook/receive/data", () => {
  it("should add a new admission", async () => {
    const newAdmissionData = {
        prkey: 'unique-key-12345',
        firstName: 'John',
        lastName: 'Doe',
        fatherName: 'Michael Doe',
        studentMobile: '1234567890',
        parentMobile: '0987654321',
        gender: 'Male',
        dob: '2000-01-01',        // ISO string is fine
        aadharCard: '123456789012', // 12-digit string
        address: '123 Main Street, Some City',
        stream: 'Science',
        course: 'B.Sc. Computer Science',
        category: 'General',
        subject12: 'Mathematics',
        year12: '2022'
      };
      

    const response = await request(app)
      .post("/api/webhook/receive/data")
      .send(newAdmissionData)
      .set("Accept", "application/json");

    expect(response.status).toBe(201);  // Checking if status code is 201
    expect(response.body.message).toBe("Student admission initiated");
    expect(response.body.data).toHaveProperty("_id");  // Ensure the returned data has _id
  });

  it("should return 400 if admission data is incomplete", async () => {
    const incompleteData = {
      prkey: "student123",
      // Missing name, age, and course
    };

    const response = await request(app)
      .post("/api/webhook/receive/data")
      .send(incompleteData)
      .set("Accept", "application/json");

    expect(response.status).toBe(400);  // Expecting a bad request error
    expect(response.body.message).toBe("Error adding admission");
  });
});
