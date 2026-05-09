const smartSyllabusService = require('../services/smartSyllabusService');
const { validationResult } = require('express-validator');

class SmartSyllabusController {

  /**
   * Get syllabus for student (smart serving based on progress)
   * GET /api/students/:studentId/syllabus/:subLevelId
   */
  async getStudentSyllabus(req, res) {
    try {
      const { studentId, subLevelId } = req.params;
      
      const result = await smartSyllabusService.getStudentSyllabus(studentId, subLevelId);
      
      res.status(200).json({
        success: true,
        data: result.version,
        type: result.type,
        message: result.message
      });

    } catch (error) {
      console.error('Error getting student syllabus:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Update syllabus with smart versioning
   * PUT /api/syllabus/smart-update/:sessionId/:subLevelId
   */
  async updateSyllabusSmartly(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { sessionId, subLevelId } = req.params;
      const updateData = req.body;
      const updatedBy = req.user?.id;

      const result = await smartSyllabusService.updateSyllabus(
        sessionId, 
        subLevelId, 
        updateData, 
        updatedBy
      );

      res.status(200).json({
        success: true,
        data: result.newVersion,
        affectedStudents: result.affectedCompletedStudents,
        message: result.message
      });

    } catch (error) {
      console.error('Error updating syllabus:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Complete student level and freeze syllabus
   * POST /api/students/:studentId/complete-level/:subLevelId
   */
  async completeStudentLevel(req, res) {
    try {
      const { studentId, subLevelId } = req.params;
      
      const result = await smartSyllabusService.completeStudentLevel(studentId, subLevelId);
      
      res.status(200).json({
        success: true,
        message: result.message,
        frozenVersion: result.frozenVersion
      });

    } catch (error) {
      console.error('Error completing student level:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get syllabus version history
   * GET /api/syllabus/history/:sessionId/:subLevelId
   */
  async getSyllabusHistory(req, res) {
    try {
      const { sessionId, subLevelId } = req.params;
      
      const history = await smartSyllabusService.getSyllabusHistory(sessionId, subLevelId);
      
      res.status(200).json({
        success: true,
        data: history
      });

    } catch (error) {
      console.error('Error getting syllabus history:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get students affected by syllabus updates
   * GET /api/syllabus/affected-students/:sessionId/:subLevelId
   */
  async getAffectedStudents(req, res) {
    try {
      const { sessionId, subLevelId } = req.params;
      
      const students = await smartSyllabusService.getAffectedStudents(sessionId, subLevelId);
      
      res.status(200).json({
        success: true,
        data: students
      });

    } catch (error) {
      console.error('Error getting affected students:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Preview syllabus update impact
   * POST /api/syllabus/preview-update/:sessionId/:subLevelId
   */
  async previewUpdateImpact(req, res) {
    try {
      const { sessionId, subLevelId } = req.params;
      
      const students = await smartSyllabusService.getAffectedStudents(sessionId, subLevelId);
      
      res.status(200).json({
        success: true,
        impact: {
          completedStudents: students.completed.length,
          currentStudents: students.current.length,
          totalAffected: students.completed.length + students.current.length,
          preservedVersions: students.completed.filter(s => s.frozenVersion).length
        },
        details: students
      });

    } catch (error) {
      console.error('Error previewing update impact:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new SmartSyllabusController();