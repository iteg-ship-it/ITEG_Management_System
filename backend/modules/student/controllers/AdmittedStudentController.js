const AdmissionProcess = require("../models/admissionProcessStudent");
const AdmittedStudent = require("../models/admittedStudent");

// ✅ Create New Admitted Student (from AdmissionProcess)
exports.createAdmittedStudent = async (req, res) => {
  try {
    console.log("Received request to create admitted student:", req.body); // Important for debugging

    const admissionId = req.updatedStudent._id;

    const admissionData = await AdmissionProcess.findById(admissionId);
    console.log("Admission Data Found:", admissionData);

    if (!admissionData || !admissionData.admissionStatus) {
      return res
        .status(400)
        .json({ message: "Student not cleared or not found." });
    }

    const newAdmitted = new AdmittedStudent({
      admissionRef: admissionData._id,
      prkey: admissionData.prkey,
      fullName: `${admissionData.firstName} ${admissionData.lastName}`,
      stream: admissionData.stream,
      course: admissionData.course,
      fatherName: admissionData.fatherName,
      address: admissionData.address,
      village: admissionData.village,
      track: admissionData.track,
      mobileNo: admissionData.studentMobile,
      email: admissionData.email || "", // Optional
    });

    await newAdmitted.save();
    return res
      .status(201)
      .json({ message: "Student admitted", data: newAdmitted });
  } catch (error) {
    console.error("Error during admission:", error); // Important for debugging
    return res
      .status(500)
      .json({ message: "Admission failed", error: error.message });
  }
};

exports.getAllStudents = async (req, res) => {
  try {
    const students = await AdmittedStudent.find();
    res.status(200).json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
