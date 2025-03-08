// const mongoose = require("mongoose");

// const studentSchema = new mongoose.Schema({
//     name: { type: String, required: true },
//     email: { type: String, required: true, unique: true },
//     course: { type: String, required: true },
//     age: { type: Number, required: true }
// }, { timestamps: true });

// module.exports = mongoose.model("Student", studentSchema);


const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
    studentId: { type: String, required: true },
    name: { type: String, required: true },
    course: { type: String, required: true },
    email: { type: String, required: true, unique: true }
});

const Student = mongoose.model("Student", studentSchema);
module.exports = Student;
