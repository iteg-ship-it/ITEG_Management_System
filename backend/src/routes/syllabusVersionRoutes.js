const express = require("express");
const router = express.Router();
const {
  createSyllabusVersion,
  getAllSyllabusVersions,
  getSyllabusVersionById,
  getSyllabusVersionWithHierarchy,
  getSyllabusVersionsBySession,
  getSyllabusVersionsBySubLevel,
  updateSyllabusVersion,
  approveSyllabusVersion,
  activateSyllabusVersion,
  archiveSyllabusVersion,
  deleteSyllabusVersion
} = require("../controllers/syllabusVersionController");

// CRUD
router.post("/", createSyllabusVersion);
router.get("/", getAllSyllabusVersions);                              // ?sessionId= &levelId= &subLevelId= &status=
router.get("/session/:sessionId", getSyllabusVersionsBySession);     // ?levelId=
router.get("/sublevel/:subLevelId", getSyllabusVersionsBySubLevel);  // ?sessionId=
router.get("/:id", getSyllabusVersionById);
router.get("/:id/hierarchy", getSyllabusVersionWithHierarchy);
router.put("/:id", updateSyllabusVersion);
router.delete("/:id", deleteSyllabusVersion);

// Workflow
router.patch("/:id/approve", approveSyllabusVersion);
router.patch("/:id/activate", activateSyllabusVersion);
router.patch("/:id/archive", archiveSyllabusVersion);

module.exports = router;
