const StudentReportCard = require('../../models/student/studentReportCard');
const mongoose = require('mongoose');

const calcSoftSkillMarks = (softSkills) => {
  let total = 0;
  if (softSkills?.categories?.length > 0) {
    softSkills.categories = softSkills.categories.map((cat) => {
      const checked = cat.subcategories.filter((s) => s.value === true).length;
      const score = Math.round((checked / (cat.subcategories.length || 1)) * (cat.maxMarks || 10));
      total += score;
      return { ...cat, score };
    });
  }
  return total;
};

const calcDisciplineMarks = (discipline) => {
  let total = 0;
  if (discipline?.categories?.length > 0) {
    discipline.categories = discipline.categories.map((cat) => {
      const checked = cat.subcategories.filter((s) => s.value === true).length;
      const score = Math.round((checked / (cat.subcategories.length || 1)) * (cat.maxMarks || 10));
      total += score;
      return { ...cat, score };
    });
  }
  return total;
};

exports.saveStudentReportCard = async (req, res) => {
  try {
    const {
      studentRef, batchYear, generatedByName,
      softSkills, discipline, technicalSkills,
      careerReadiness, academicPerformance, coCurricular,
      overallGrade, facultyRemark, isFinalReport,
      templateType, dynamicSections,
    } = req.body;

    const totalSoftSkillMarks = calcSoftSkillMarks(softSkills);
    const totalDisciplineMarks = calcDisciplineMarks(discipline);

    const reportCardData = {
      studentRef, batchYear, generatedByName,
      softSkills: { ...softSkills, totalSoftSkillMarks },
      discipline: { ...discipline, totalDisciplineMarks },
      technicalSkills, careerReadiness, academicPerformance,
      coCurricular, overallGrade, facultyRemark, isFinalReport,
      templateType, dynamicSections,
    };

    const saved = await StudentReportCard.findOneAndUpdate(
      { studentRef },
      reportCardData,
      { new: true, upsert: true }
    );

    res.status(201).json({ success: true, message: 'Report card saved successfully', data: saved });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error while saving report card', error: error.message });
  }
};

exports.getStudentReportCard = async (req, res) => {
  try {
    const { studentId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({ success: false, message: 'Invalid student ID' });
    }

    const reportCard = await StudentReportCard.findOne({ studentRef: studentId }).populate('studentRef', 'firstName lastName prkey');
    if (!reportCard) {
      return res.status(404).json({ success: false, message: 'Report card not found for this student' });
    }

    res.status(200).json({ success: true, data: reportCard });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

exports.getStudentReportCardForEdit = async (req, res) => {
  try {
    const { studentId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({ success: false, message: 'Invalid student ID' });
    }

    const reportCard = await StudentReportCard.findOne({ studentRef: studentId });
    res.status(200).json({
      success: true,
      message: reportCard ? 'Report card data retrieved for editing' : 'No existing report card found',
      data: reportCard || null,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

exports.getAllReportCards = async (req, res) => {
  try {
    const { batchYear, isFinalReport } = req.query;
    const filter = {};
    if (batchYear) filter.batchYear = batchYear;
    if (isFinalReport !== undefined) filter.isFinalReport = isFinalReport === 'true';

    const reportCards = await StudentReportCard.find(filter)
      .populate('studentRef', 'firstName lastName prkey')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: reportCards.length, data: reportCards });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

exports.updateStudentReportCard = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      softSkills, discipline, technicalSkills, careerReadiness,
      academicPerformance, coCurricular, overallGrade,
      facultyRemark, isFinalReport, generatedByName, batchYear,
      templateType, dynamicSections,
    } = req.body;

    const totalSoftSkillMarks = calcSoftSkillMarks(softSkills);
    const totalDisciplineMarks = calcDisciplineMarks(discipline);

    const updatedData = {
      generatedByName, batchYear, templateType, dynamicSections,
      ...(softSkills && { softSkills: { ...softSkills, totalSoftSkillMarks } }),
      ...(discipline && { discipline: { ...discipline, totalDisciplineMarks } }),
      technicalSkills, careerReadiness, academicPerformance,
      coCurricular, overallGrade, facultyRemark, isFinalReport,
    };

    Object.keys(updatedData).forEach((key) => updatedData[key] === undefined && delete updatedData[key]);

    const updated = await StudentReportCard.findOneAndUpdate(
      { _id: id },
      updatedData,
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Report card not found' });
    }

    res.status(200).json({ success: true, message: 'Report card updated successfully', data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error while updating report card', error: error.message });
  }
};
