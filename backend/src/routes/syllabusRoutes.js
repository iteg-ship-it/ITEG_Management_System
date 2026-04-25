const express = require("express");
const router  = express.Router();

const syllabusVersionCtrl = require("../controllers/syllabus/syllabusVersionController");
const subjectCtrl         = require("../controllers/syllabus/subjectController");
const topicCtrl           = require("../controllers/syllabus/topicController");
const subTopicCtrl        = require("../controllers/syllabus/subTopicController");
const taskMasterCtrl      = require("../controllers/syllabus/taskMasterController");
const taskMasterBulkCtrl  = require("../controllers/syllabus/taskMasterBulkController");

// ── SyllabusVersion ──────────────────────────────────────────
router.post  ("/versions",                          syllabusVersionCtrl.createSyllabusVersion);
router.get   ("/versions",                          syllabusVersionCtrl.getAllSyllabusVersions);
router.get   ("/versions/sublevel/:subLevelId",     syllabusVersionCtrl.getSyllabusVersionsBySubLevel);
router.get   ("/versions/session/:sessionId",       syllabusVersionCtrl.getSyllabusVersionsBySession);
router.get   ("/versions/:id",                      syllabusVersionCtrl.getSyllabusVersionById);
router.get   ("/versions/:id/hierarchy",            syllabusVersionCtrl.getSyllabusVersionWithHierarchy);
router.put   ("/versions/:id",                      syllabusVersionCtrl.updateSyllabusVersion);
router.patch ("/versions/:id/approve",              syllabusVersionCtrl.approveSyllabusVersion);
router.patch ("/versions/:id/activate",             syllabusVersionCtrl.activateSyllabusVersion);
router.patch ("/versions/:id/archive",              syllabusVersionCtrl.archiveSyllabusVersion);
router.delete("/versions/:id",                      syllabusVersionCtrl.deleteSyllabusVersion);

// ── Subject ──────────────────────────────────────────────────
router.post  ("/subjects",                          subjectCtrl.createSubject);
router.get   ("/subjects/version/:syllabusVersionId", subjectCtrl.getSubjectsBySyllabusVersion);
router.get   ("/subjects/:id",                      subjectCtrl.getSubjectById);
router.put   ("/subjects/:id",                      subjectCtrl.updateSubject);
router.delete("/subjects/:id",                      subjectCtrl.deleteSubject);

// ── Topic ────────────────────────────────────────────────────
router.post  ("/topics",                            topicCtrl.createTopic);
router.get   ("/topics/subject/:subjectId",         topicCtrl.getTopicsBySubject);
router.get   ("/topics/:id",                        topicCtrl.getTopicById);
router.put   ("/topics/:id",                        topicCtrl.updateTopic);
router.delete("/topics/:id",                        topicCtrl.deleteTopic);

// ── SubTopic ─────────────────────────────────────────────────
router.post  ("/subtopics",                         subTopicCtrl.createSubTopic);
router.get   ("/subtopics/topic/:topicId",          subTopicCtrl.getSubTopicsByTopic);
router.get   ("/subtopics/:id",                     subTopicCtrl.getSubTopicById);
router.put   ("/subtopics/:id",                     subTopicCtrl.updateSubTopic);
router.delete("/subtopics/:id",                     subTopicCtrl.deleteSubTopic);

// ── TaskMaster ───────────────────────────────────────────────
router.post  ("/tasks",                             taskMasterCtrl.createTask);
router.post  ("/tasks/bulk-upload",                 taskMasterBulkCtrl.bulkUploadTasks);
router.get   ("/tasks",                             taskMasterCtrl.getAllTasks);
router.get   ("/tasks/topic/:topicId",              taskMasterCtrl.getTasksByTopic);
router.get   ("/tasks/subtopic/:subTopicId",        taskMasterCtrl.getTasksBySubTopic);
router.get   ("/tasks/:id",                         taskMasterCtrl.getTaskById);
router.put   ("/tasks/:id",                         taskMasterCtrl.updateTask);
router.delete("/tasks/:id",                         taskMasterCtrl.deleteTask);

module.exports = router;
