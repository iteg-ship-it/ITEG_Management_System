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

exports.getStudentById = async (req, res) => {
  try { 
    const { id } = req.params;
    const student = await AdmittedStudent.findById(id);
    if (!student) { 
      return res.status(404).json({ message: "Student not found" });
    }
    res.status(200).json(student);
  } catch (error) {
    console.error("Error fetching student:", error);
    res.status(500).json({ message: "Server Error", error });
  }
};


exports.createLevels = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      levelNo,
      Theoretical_Marks,
      Practical_Marks,
      Communication_Marks,
      marks,
      remark,
      date,
      result
    } = req.body;

    const student = await AdmittedStudent.findById(id);
    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    const interviews = student.level|| [];

    const LevelOrder = ["1A", "1B", "1C", "2A", "2B", "2C"];
   

    // const requestedRoundIndex = LevelOrder.indexOf(levelNo);


    // Find previous highest passed round
    let lastPassedRoundIndex = -1;
    for (let i = 0; i < LevelOrder.length; i++) {
      const passed = interviews.some(interview => interview.levelNo === LevelOrder[i] && interview.result === "Pass");
      if (passed) {
        lastPassedRoundIndex = i;
      } else {
        break;
      }
    }

 const nextLevel = LevelOrder[lastPassedRoundIndex + 1];

   if (!nextLevel) {
      return res.status(400).json({
        success: false,
        message: "All levels already passed. No further levels to attempt.",
      });
    }

    // Check if round already passed
    const  currentLevelAttempts = interviews.filter(i => i.levelNo === levelNo);
    if (currentLevelAttempts.some(i => i.result === "Pass")) {
      return res.status(400).json({
        success: false,
        message: `Round ${levelNo} already passed. Please move to next round.`,
      });
    }

    const newInterview = {
      levelNo:nextLevel,
      noOfAttempts: currentLevelAttempts.length + 1,
      Theoretical_Marks: Theoretical_Marks || 0,
      Practical_Marks: Practical_Marks || 0,
      Communication_Marks: Communication_Marks || 0,
      marks: marks || 0,
      remark: remark || "",
      date: date || new Date(),
      result: result || "Pending",
    };


    student.level.push(newInterview);
    await student.save();

    res.status(201).json({
      success: true,
      message: "Interview round added successfully",
      student,
    });

  } catch (error) {
    console.error("Error adding interview round:", error);
    res.status(500).json({ success: false, message: "Server Error", error });
  }
};
