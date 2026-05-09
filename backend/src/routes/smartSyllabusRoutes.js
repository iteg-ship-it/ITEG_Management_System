const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const smartSyllabusController = require('../controllers/smartSyllabusController');
const authMiddleware = require('../middlewares/authMiddleware');

// Validation middleware
const syllabusUpdateValidation = [
  body('subjects').optional().isArray().withMessage('Subjects must be an array'),
  body('title').optional().isString().withMessage('Title must be a string'),
  body('changeLog').optional().isString().withMessage('Change log must be a string')
];

// Get syllabus for student (smart serving)
router.get('/students/:studentId/syllabus/:subLevelId', 
  authMiddleware, 
  smartSyllabusController.getStudentSyllabus
);

// Update syllabus with smart versioning
router.put('/syllabus/smart-update/:sessionId/:subLevelId', 
  authMiddleware,
  syllabusUpdateValidation,
  smartSyllabusController.updateSyllabusSmartly
);

// Complete student level and freeze syllabus
router.post('/students/:studentId/complete-level/:subLevelId', 
  authMiddleware,
  smartSyllabusController.completeStudentLevel
);

// Get syllabus version history
router.get('/syllabus/history/:sessionId/:subLevelId', 
  authMiddleware,
  smartSyllabusController.getSyllabusHistory
);

// Get students affected by syllabus updates
router.get('/syllabus/affected-students/:sessionId/:subLevelId', 
  authMiddleware,
  smartSyllabusController.getAffectedStudents
);

// Preview syllabus update impact
router.post('/syllabus/preview-update/:sessionId/:subLevelId', 
  authMiddleware,
  smartSyllabusController.previewUpdateImpact
);

module.exports = router;