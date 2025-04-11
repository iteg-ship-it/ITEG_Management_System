const Student = require("../models/AdmittedStudents");

// Create a new student
exports.createStudent = async (req, res) => {
    try {
        const student = new Student(req.body);
        await student.save();
        res.status(201).json(student);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Get all students
exports.getAllStudents = async (req, res) => {
    try {
        const students = await Student.find();
        res.status(200).json(students);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get a single student by ID
exports.getStudentById = async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);
        if (!student) return res.status(404).json({ message: "Student not found" });
        res.status(200).json(student);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// Update student by ID
// exports.updateStudent = async (req, res) => {
//     try {
//         const { id } = req.params;
//         const updatedStudent = await Student.findByIdAndUpdate(id, req.body, { new: true });

//         if (!updatedStudent) {
//             return res.status(404).json({ message: "Student not found" });
//         }

//         res.status(200).json(updatedStudent);
//     } catch (error) {
//         console.error("Update Error:", error);
//         res.status(500).json({ message: "Server error while updating student" });
//     }
// };

exports.updateStudent = async (req, res) => {
    try {
        const { id } = req.params;

        // Validate MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Invalid student ID" });
        }

        // Ensure `_id` is not being updated
        if (req.body._id) {
            delete req.body._id;
        }

        // Find and update the student
        const updatedStudent = await Student.findByIdAndUpdate(id, req.body, { 
            new: true, 
            runValidators: true // Ensures validation rules are checked
        });

        if (!updatedStudent) {
            return res.status(404).json({ success: false, message: "Student not found" });
        }

        res.status(200).json({ success: true, data: updatedStudent });
    } catch (error) {
        console.error("Update Error:", error);
        res.status(500).json({ success: false, message: "Server error while updating student", error: error.message });
    }
};



exports.deleteStudent = async (req, res) => {
    try {
        const student = await Student.findByIdAndDelete(req.params.id);
        if (!student) return res.status(404).json({ message: "Student not found" });
        res.status(200).json({ message: "Student deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// // Migrate Students
// exports.migrateStudents = async (req, res) => {
//     try {
//         // Migration logic here
//         res.status(200).json({ message: "Students migrated successfully" });
//     } catch (error) {
//         res.status(500).json({ message: "Server Error", error });
//     }
// };

// // // Migrate Student Data from SQL to MongoDB
// // exports.migrateStudents = async (req, res) => {
// //     try {
// //         // Fetch Data from MySQL
// //         const [students] = await sqlPool.query("SELECT studentId, name, course, email FROM students");

// //         if (students.length === 0) {
// //             return res.status(404).json({ message: "No student data found in SQL database" });
// //         }

// //         // Insert Data into MongoDB
// //         await Student.insertMany(students);

// //         res.status(200).json({ message: "Student data migrated successfully!", migratedCount: students.length });
// //     } catch (error) {
// //         console.error("Error in migrating student data:", error);
// //         res.status(500).json({ message: "Server Error", error: error.message });
// //     }
// // };



// // // Migrate Students (Without SQL)
// // exports.migrateStudents = async (req, res) => {
// //     try {
// //         const students = mockStudents; // SQL ke bina dummy data use karenge

// //         // MongoDB me data insert karo
// //         const savedStudents = await Student.insertMany(students);

// //         res.status(201).json({ message: "Student data migrated successfully!", data: savedStudents });
// //     } catch (error) {
// //         res.status(500).json({ message: "Server Error", error: error.message });
// //     }
// // };
// async (req, res) => {
//     try {
//         const { name, email, course, age } = req.body;
//         if (!name || !email || !course || !age) {
//             return res.status(400).json({ message: "All fields are required" });
//         }
        
//         const newStudent = new Student({ name, email, course, age });
//         await newStudent.save();
//         res.status(201).json({ message: "Student registered successfully", student: newStudent });

//     } catch (error) {
//         res.status(500).json({ message: "Server Error", error });
//     }
// }


// // // Faculty, Admin, & Super Admin Can Migrate Data
// // exports.migrateStudents = async (req, res) => {
// //     try {
// //         // Migration logic yahan likho
// //         res.status(200).json({ message: "Student data migrated successfully" });
// //     } catch (error) {
// //         res.status(500).json({ message: "Server Error", error });
// //     }
// // };


// company interviewRecord
exports.addInterviewRecord = async (req, res) => {
    try {
        const studentId = req.params.id; // Get student ID from URL parameter
        const { companyName, interviewDate, remark, result, location, jobProfile } = req.body;

        if (!studentId || !companyName || !interviewDate || !result || !location || !jobProfile) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        // Validate result value against the allowed enum
        const validResults = ["Selected", "Rejected", "Pending"];
        if (!validResults.includes(result)) {
            return res.status(400).json({ success: false, message: `Invalid result value. Allowed values: ${validResults.join(", ")}` });
        }

        // Find the student by ID
        const student = await Student.findById(studentId);
        if (!student) {
            return res.status(404).json({ success: false, message: "Student not found" });
        }

        // Create new interview record
        const newInterview = {
            companyName,
            interviewDate,
            remark,
            result,
            location,
            jobProfile
        };

        // Push the new interview record into the student's interviewRecord array
        student.interviewRecord.push(newInterview);

        // Save the updated student document
        await student.save();

        res.status(201).json({ success: true, message: "Interview record added successfully", interviewRecord: newInterview });
    } catch (error) {
        console.error("Error adding interview record:", error);
        res.status(500).json({ success: false, message: "Server Error", error });
    }
};


exports.getStudentInterview = async (req, res) => {
    try {
        const studentId = req.params.id; // Get student ID from URL params

        if (!studentId) {
            return res.status(400).json({ success: false, message: "studentId is required" });
        }

        // Fetch the student record along with all interview records
        const student = await Student.findById(studentId).select("fullName email interviewRecord");

        if (!student) {
            return res.status(404).json({ success: false, message: "Student not found" });
        }

        res.status(200).json({ success: true, interviewRecords: student.interviewRecord });
    } catch (error) {
        console.error("Error fetching student interview records:", error);
        res.status(500).json({ success: false, message: "Server Error", error });
    }
};

// update interview result
exports.updateInterviewResult = async (req, res) => {
    try {
        const studentId = req.params.id; // Get student ID from URL parameter
        const { interviewId, result } = req.body; // Get interview ID and new result from request body

        if (!studentId || !interviewId || !result) {
            return res.status(400).json({ success: false, message: "studentId, interviewId, and result are required" });
        }

        // Find student by ID
        const student = await Student.findById(studentId);
        if (!student) {
            return res.status(404).json({ success: false, message: "Student not found" });
        }

        // Find the specific interview record inside the array
        const interview = student.interviewRecord.id(interviewId);
        if (!interview) {
            return res.status(404).json({ success: false, message: "Interview record not found" });
        }

        // Update the interview result
        interview.result = result;

        // Save the updated student document
        await student.save();

        res.status(200).json({ success: true, message: "Interview result updated successfully", updatedInterview: interview });
    } catch (error) {
        console.error("Error updating interview result:", error);
        res.status(500).json({ success: false, message: "Server Error", error });
    }
};



// Create Permission Student API
exports.createPermissionStudent = async (req, res) => {
    try {
      const { 
        fullName, stream, course, fatherName, motherName, mobileNo, 
        fatherNo, email, track, address, level, techno, attendancePercentage, 
        placedInfo, interviewRecord, readinessStatus, permission 
      } = req.body;
  
      // Validate Base64 Image (optional check)
      if (permission?.reason && !/^data:image\/(png|jpeg|jpg);base64,/.test(permission.reason)) {
        return res.status(400).json({ message: "Invalid image format. Must be Base64." });
      }
  
      // Check if student already exists
      const existingStudent = await Student.findOne({ email });
      if (existingStudent) {
        return res.status(400).json({ message: "Student already exists" });
      }
  
      // Create new student with permission
      const newStudent = new Student({
        fullName,
        stream,
        course,
        fatherName,
        motherName,
        mobileNo,
        fatherNo,
        email,
        track,
        address,
        level,
        techno,
        attendancePercentage,
        placedInfo,
        interviewRecord,
        readinessStatus,
        permission: permission ? {
          reason: permission.reason,
          approvedBy: permission.approvedBy
        } : undefined
      });
  
      await newStudent.save();
      res.status(201).json({ message: "Permission Student Created Successfully", student: newStudent });
  
    } catch (error) {
      console.error("Create Permission Student Error:", error);
      res.status(500).json({ message: "Server Error", error });
    }
  };

//All Permission Student list show
exports.getAllPermissionStudents = async (req, res) => {
    try {
    //   Fetch students with permissionGranted = true
      const students = await Student.find({ permission: true }).select('-password');
  
      res.status(200).json({
        success: true,
        count: students.length,
        data: students,
      });
    } catch (error) {
      console.error("Get Permission Students Error:", error);
      res.status(500).json({ message: "Server Error", error });
    }
    // try {
    //     const students = await Student.find({ "permission.approvedBy": { $exists: true } });
    
    //     if (students.length === 0) {
    //       return res.status(404).json({ message: "No permission students found" });
    //     }
    
    //     res.status(200).json(students);
    //   } catch (error) {
    //     res.status(500).json({ message: "Server Error", error });
    //   }
  };
  

// Get All Permission Students API
exports.getAllPermissionStudents = async (req, res) => {
    try {
      // Fetch students where permission is granted (approvedBy exists)
      const students = await Student.find({ "permission.approvedBy": { $exists: true } }).select('-password');
  
      res.status(200).json({
        success: true,
        count: students.length,
        data: students
      });
    } catch (error) {
      console.error("Get Permission Students Error:", error);
      res.status(500).json({ message: "Server Error", error });
    }
  };




  // update Permission Student API
// exports.updatePermissionStudent = async (req, res) => {
//     try {
//       const { studentId, reason, approvedBy } = req.body;
  
//       // Validate required fields
//       if (!studentId || !reason || !approvedBy) {
//         return res.status(400).json({ message: "All fields are required" });
//       }
  
//       // Find student by ID
//       const student = await Student.findById(studentId);
//       if (!student) {
//         return res.status(404).json({ message: "Student not found" });
//       }
  
//       // Update permission
//       student.permission = { reason, approvedBy };
//       await student.save();
  
//       res.status(200).json({ message: "Permission granted successfully", student });
//     } catch (error) {
//       console.error("Create Permission Error:", error);
//       res.status(500).json({ message: "Server Error", error });
//     }
//   };





// Update Permission Student API
exports.updatePermissionStudent = async (req, res) => {
    try {
      const { studentId } = req.params;
      const { reason, approvedBy } = req.body;
  
      // Validate Base64 Image (optional check)
      if (reason && !/^data:image\/(png|jpeg|jpg);base64,/.test(reason)) {
        return res.status(400).json({ message: "Invalid image format. Must be Base64." });
      }
  
      // Check if student exists
      const student = await Student.findById(studentId);
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }
  
      // Update permission field
      student.permission = {
        reason: reason || student.permission?.reason,
        approvedBy: approvedBy || student.permission?.approvedBy
      };
  
      await student.save();
      res.status(200).json({ message: "Permission updated successfully", student });
  
    } catch (error) {
      console.error("Update Permission Error:", error);
      res.status(500).json({ message: "Server Error", error });
    }
  };


// // Fetch Levels - No Authentication Required
// exports.getLevels = async (req, res) => {
//     try {
//         const { studentId, levelName, className } = req.query;
//         let query = {};

//         if (studentId) query.studentId = studentId;
//         if (levelName) query.levelName = levelName;
//         if (className) query.className = className;

//         const levels = await Level.find(query).populate("studentId", "name email");
//         res.status(200).json({ success: true, levels });
//     } catch (error) {
//         console.error("Error fetching levels:", error);
//         res.status(500).json({ message: "Server Error", error });
//     }
// };

exports.createLevel = async (req, res) => {
    try {
        const { id } = req.params;  // Get student ID from URL
        const { levelNo, noOfAttempts, marks, remark, date, result } = req.body;  // Extract data from request body

        // Validate required fields
        if (!levelNo) {
            return res.status(400).json({ success: false, message: "Level number is required" });
        }

        // Find student by ID
        const student = await Student.findById(id);
        if (!student) {
            return res.status(404).json({ success: false, message: "Student not found" });
        }

        // Add new level to student's level array
        const newLevel = {
            levelNo,
            noOfAttempts: noOfAttempts || 0,
            marks: marks || 0,
            remark: remark || "",
            date: date || new Date(),
            result: result || "Pending"
        };

        student.level.push(newLevel);
        await student.save();  // Save changes to database

        res.status(201).json({
            success: true,
            message: "Level added successfully",
            student
        });
    } catch (error) {
        console.error("Error adding level:", error);
        res.status(500).json({ success: false, message: "Server Error", error });
    }
};


exports.getStudentsByLevel = async (req, res) => {
    try {
        const { levelNo } = req.params; // Get levelNo from URL params

        if (!levelNo) {
            return res.status(400).json({ success: false, message: "Level number is required" });
        }

        // Find students whose last level in the level array matches levelNo
        const students = await Student.find({
            $expr: { $eq: [{ $arrayElemAt: ["$level.levelNo", -1] }, levelNo] }
        });

        if (students.length === 0) {
            return res.status(404).json({ success: false, message: "No students found with the last level matching " + levelNo });
        }

        res.status(200).json({ success: true, students });
    } catch (error) {
        console.error("Error fetching students by last level:", error);
        res.status(500).json({ success: false, message: "Server Error", error });
    }
};


exports.getStudentCountBySpecificLevel = async (req, res) => {
    try {
        const { levelNo } = req.params; // Get levelNo from URL params

        if (!levelNo) {
            return res.status(400).json({ success: false, message: "Level number is required" });
        }

        // Count students where the last level in the array matches levelNo
        const studentCount = await Student.countDocuments({
            $expr: { $eq: [{ $arrayElemAt: ["$level.levelNo", -1] }, levelNo] }
        });

        res.status(200).json({ success: true, levelNo, count: studentCount });
    } catch (error) {
        console.error("Error fetching student count by last level:", error);
        res.status(500).json({ success: false, message: "Server Error", error });
    }
};


exports.getStudentLevels = async (req, res) => {
  try {
    const { id } = req.params;

    // Find student by ID
    const student = await Student.findById(id).select("level fullName email");

    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    res.status(200).json({ success: true, levels: student.level, student });
  } catch (error) {
    console.error("Error fetching student levels:", error);
    res.status(500).json({ success: false, message: "Server Error", error });
  }
};



// // Function to generate a certificate (Mock function)
// const generateCertificate = (studentName, levelName) => {
//     return `https://certificates.example.com/${studentName}_${levelName}_certificate.pdf`; // Fake URL
// };

