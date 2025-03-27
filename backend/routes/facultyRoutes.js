const express = require("express"); 
const path = require("path");
const {
    getAllFaculties,
    getFacultyById,
    createFaculty,
    updateFaculty,
    deleteFaculty
} = require(path.join(__dirname, "../modules/Faculty/controllers/FacultyController"));

const { verifyToken, checkRole } = require("../middlewares/authMiddleware");
const router = express.Router();

// Get all faculties (Accessible by Admin only)
router.get('/', verifyToken, checkRole(['Admin']), getAllFaculties);

// Get faculty by ID (Accessible by Admin and Faculty)
router.get('/:id', verifyToken, checkRole(['Admin', 'Faculty']), getFacultyById);

// Create new faculty (Admin only)
router.post('/', verifyToken, checkRole(['Admin']), createFaculty);

// Update faculty by ID (Admin only)
router.put('/:id', verifyToken, checkRole(['Admin']), updateFaculty);

// Delete faculty by ID (Admin only)
router.delete('/:id', verifyToken, checkRole(['Admin']), deleteFaculty);

module.exports = router;
