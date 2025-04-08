const express = require("express"); 
const path = require("path");
const {
    getAllFaculties,
    getFacultyById,
    createFaculty,
    updateFaculty,
    deleteFaculty,
    createFacultyLogin
} = require(path.join(__dirname, "../modules/Faculty/controllers/FacultyController"));

const { verifyToken, checkRole } = require("../middlewares/authMiddleware");
const router = express.Router();

// Get all faculties (Accessible by Admin only)
router.get('/', verifyToken, checkRole(['Super Admin','Admin']), getAllFaculties);

// Get faculty by ID (Accessible by Admin and Faculty)
router.get('/:id', verifyToken, checkRole(['Super Admin','Admin','Faculty']), getFacultyById);

// Create new faculty (Admin only)
router.post('/', verifyToken, checkRole(['Super Admin', 'Admin']), createFaculty);

// Update faculty by ID (Admin only)
router.put('/:id', verifyToken, checkRole(['Super Admin','Admin','Faculty']), updateFaculty);

// Delete faculty by ID (Admin only)
router.delete('/:id', verifyToken, checkRole(['Super Admin','Admin']), deleteFaculty);
 
router.post('/login', createFacultyLogin )

module.exports = router;
