const AdmittedStudent = require("../models/admittedStudent");
const Company = require("../models/company");

// Create placement post data
exports.createPlacementPost = async (req, res) => {
  try {
    console.log("Request body:", req.body);
    
    const { 
      studentId, 
      position, 
      companyName, 
      companyLogo, 
      headOffice,
      studentImage 
    } = req.body;

    if (!studentId || !position || !companyName || !headOffice) {
      console.log("Missing fields:", { studentId, position, companyName, headOffice });
      return res.status(400).json({ 
        message: "Missing required fields: studentId, position, companyName, headOffice" 
      });
    }

    const student = await AdmittedStudent.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    let company = await Company.findOne({ companyName });
    
    if (!company) {
      if (!companyLogo) {
        return res.status(400).json({ 
          message: "Company logo is required for new company. Please provide base64 image or upload file.",
          example: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
        });
      }
      
      if (!companyLogo.startsWith('data:image/')) {
        return res.status(400).json({ 
          message: "Invalid logo format. Must be base64 image starting with 'data:image/'"
        });
      }
      
      company = new Company({
        companyName,
        companyLogo,
        headOffice
      });
      await company.save();
    }

    const finalStudentImage = studentImage || student.image;
    
    if (!finalStudentImage) {
      return res.status(400).json({ 
        message: "Student image is required (either upload new or student must have profile image)" 
      });
    }

    const placementPostData = {
      student: {
        id: student._id,
        name: `${student.firstName} ${student.lastName}`,
        year: student.year,
        course: student.course,
        image: finalStudentImage
      },
      company: {
        id: company._id,
        name: company.companyName,
        logo: company.companyLogo,
        headOffice: company.headOffice
      },
      position,
      createdAt: new Date()
    };

    res.status(200).json({
      success: true,
      message: "Placement post data prepared successfully",
      data: placementPostData
    });

  } catch (error) {
    console.error("Error creating placement post:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error", 
      error: error.message 
    });
  }
};

// Get all companies
exports.getAllCompanies = async (req, res) => {
  try {
    const companies = await Company.find().select('companyName companyLogo headOffice');
    res.status(200).json({
      success: true,
      data: companies
    });
  } catch (error) {
    console.error("Error fetching companies:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error", 
      error: error.message 
    });
  }
};

// Get company by name
exports.getCompanyByName = async (req, res) => {
  try {
    const { companyName } = req.params;
    const company = await Company.findOne({ companyName });
    
    if (!company) {
      return res.status(404).json({ 
        success: false, 
        message: "Company not found" 
      });
    }

    res.status(200).json({
      success: true,
      data: company
    });
  } catch (error) {
    console.error("Error fetching company:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error", 
      error: error.message 
    });
  }
};

// Upload placement documents
exports.uploadPlacementDocuments = async (req, res) => {
  try {
    const { 
      studentId, 
      offerLetter, 
      commitmentApplication, 
      uploadedBy 
    } = req.body;

    if (!studentId || !offerLetter || !commitmentApplication || !uploadedBy) {
      return res.status(400).json({ 
        message: "Missing required fields: studentId, offerLetter, commitmentApplication, uploadedBy" 
      });
    }

    const student = await AdmittedStudent.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    if (!student.placedInfo) {
      return res.status(400).json({ message: "Student is not placed yet" });
    }

    if (student.offerLetter && student.commitmentApplication) {
      return res.status(400).json({ message: "Documents already uploaded" });
    }

    student.offerLetter = offerLetter;
    student.commitmentApplication = commitmentApplication;
    student.documentsUploadedBy = uploadedBy;
    student.documentsUploadedAt = new Date();

    await student.save();

    res.status(200).json({
      success: true,
      message: "Placement documents uploaded successfully"
    });

  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Server error", 
      error: error.message 
    });
  }
};

// Get placement documents
exports.getPlacementDocuments = async (req, res) => {
  try {
    const { studentId } = req.params;

    const student = await AdmittedStudent.findById(studentId)
      .select('firstName lastName offerLetter commitmentApplication documentsUploadedBy documentsUploadedAt');

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    if (!student.offerLetter || !student.commitmentApplication) {
      return res.status(404).json({ message: "No documents found" });
    }

    res.status(200).json({
      success: true,
      data: student
    });

  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Server error", 
      error: error.message 
    });
  }
};