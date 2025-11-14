const StudentReportCard = require('../models/studentReportCard');

/**
 * 🧾 Create a new Student Report Card
 * Automatically calculates total scores from soft skills & discipline
 */
exports.saveStudentReportCard = async (req, res) => {
  try {
    const {
      studentRef,
      batchYear,
      generatedByName,
      softSkills,
      discipline,
      technicalSkills,
      careerReadiness,
      academicPerformance,
      coCurricular,
      overallGrade,
      facultyRemark,
      isFinalReport,
    } = req.body;

    /* =====================================================
       🧮 CALCULATE TOTAL SOFT SKILL MARKS
    ===================================================== */
    let totalSoftSkillMarks = 0;

    if (softSkills && softSkills.categories && softSkills.categories.length > 0) {
      softSkills.categories = softSkills.categories.map((category) => {
        const checkedCount = category.subcategories.filter((s) => s.value === true).length;
        const subCount = category.subcategories.length || 1;
        const max = category.maxMarks || 10;

        const score = Math.round((checkedCount / subCount) * max);
        totalSoftSkillMarks += score;

        return { ...category, score };
      });
    }

    /* =====================================================
       🧮 CALCULATE TOTAL DISCIPLINE MARKS
    ===================================================== */
    let totalDisciplineMarks = 0;

    if (discipline && discipline.categories && discipline.categories.length > 0) {
      discipline.categories = discipline.categories.map((category) => {
        const checkedCount = category.subcategories.filter((s) => s.value === true).length;
        const subCount = category.subcategories.length || 1;
        const max = category.maxMarks || 10;

        const score = Math.round((checkedCount / subCount) * max);
        totalDisciplineMarks += score;

        return { ...category, score };
      });
    }

    /* =====================================================
       🧾 CREATE OR UPDATE REPORT CARD DOCUMENT
    ===================================================== */
    const reportCardData = {
      studentRef,
      batchYear,
      generatedByName,

      softSkills: {
        ...softSkills,
        totalSoftSkillMarks,
      },

      discipline: {
        ...discipline,
        totalDisciplineMarks,
      },

      technicalSkills,
      careerReadiness,
      academicPerformance,
      coCurricular,
      overallGrade,
      facultyRemark,
      isFinalReport,
    };

    const savedReportCard = await StudentReportCard.findOneAndUpdate(
      { studentRef },
      reportCardData,
      { new: true, upsert: true }
    );

    res.status(201).json({
      success: true,
      message: "Report card saved successfully",
      data: savedReportCard,
    });
  } catch (error) {
    console.error("❌ Error saving report card:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while saving report card",
      error: error.message,
    });
  }
};

exports.getStudentReportCard = async (req, res) => {
  try {
    const { studentId } = req.params;

    const reportCard = await StudentReportCard.findOne({ studentRef: studentId });

    if (!reportCard) {
      return res.status(404).json({
        success: false,
        message: 'Report card not found for this student'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Report card retrieved successfully',
      data: reportCard
    });

  } catch (error) {
    console.error('Error retrieving report card:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// New endpoint for getting report card data for editing
exports.getStudentReportCardForEdit = async (req, res) => {
  try {
    const { studentId } = req.params;
    console.log('🔍 Fetching report card for edit - Student ID:', studentId);

    const reportCard = await StudentReportCard.findOne({ studentRef: studentId });
    console.log('📄 Found report card:', reportCard ? 'Yes' : 'No');

    // If no report card exists, return empty structure for new creation
    if (!reportCard) {
      console.log('✅ No existing report card found');
      return res.status(200).json({
        success: true,
        message: 'No existing report card found, returning empty structure',
        data: null
      });
    }

    console.log('✅ Report card data retrieved successfully');
    res.status(200).json({
      success: true,
      message: 'Report card data retrieved for editing',
      data: reportCard
    });

  } catch (error) {
    console.error('❌ Error retrieving report card for edit:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

exports.getAllReportCards = async (req, res) => {
  try {
    const { batchYear, isFinalReport } = req.query;
    const filter = {};

    if (batchYear) filter.batchYear = batchYear;
    if (isFinalReport !== undefined) filter.isFinalReport = isFinalReport === 'true';

    const reportCards = await StudentReportCard.find(filter)
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: 'Report cards retrieved successfully',
      count: reportCards.length,
      data: reportCards
    });

  } catch (error) {
    console.error('Error retrieving report cards:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};
