const express = require("express");
const router = express.Router();
const syllabusController = require("../controllers/syllabusController");

// Syllabus CRUD
router.post("/", syllabusController.createSyllabus);
router.get("/", syllabusController.getAllSyllabus);
router.get("/:id", syllabusController.getSyllabusById);
router.put("/:id", syllabusController.updateSyllabus);
router.delete("/:id", syllabusController.deleteSyllabus);

// Syllabus workflow
router.post("/:id/approve", syllabusController.approveSyllabus);
router.post("/:id/activate", syllabusController.activateSyllabus);

module.exports = router;
