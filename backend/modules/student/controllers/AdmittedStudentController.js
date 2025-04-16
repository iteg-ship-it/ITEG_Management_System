
const AdmissionProcess = require("../models/admissionProcessStudent");
const AdmittedStudent = require("../models/admittedStudent");

// ✅ Create New Admitted Student (from AdmissionProcess)
exports.createAdmittedStudent = async (req, res) => {
  try {
    const { admissionId, email } = req.body;

    const admissionData = await AdmissionProcess.findById(admissionId);
    console.log("Admission Data Found:", admissionData);

    if (!admissionData || !admissionData.admissionFlag) {
      return res.status(400).json({ message: "Student not cleared or not found." });
    }

    const newAdmitted = new AdmittedStudent({
      admissionRef: admissionData._id,
      fullName: `${admissionData.firstName} ${admissionData.lastName}`,
      stream: admissionData.stream,
      course: admissionData.course,
      fatherName: admissionData.fatherName,
      mobileNo: admissionData.studentMobile,
      email: email || "", // Optional
    });

    await newAdmitted.save();
    return res.status(201).json({ message: "Student admitted", data: newAdmitted });

  } catch (error) {
    console.error("Error during admission:", error); // Important for debugging
    return res.status(500).json({ message: "Admission failed", error: error.message });
  }
};



