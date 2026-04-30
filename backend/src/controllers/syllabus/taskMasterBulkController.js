const TaskMaster    = require("../../models/syllabus/TaskMaster");
const SyllabusVersion = require("../../models/syllabus/SyllabusVersion");
const Subject       = require("../../models/syllabus/Subject");
const Topic         = require("../../models/syllabus/Topic");
const SubTopic      = require("../../models/syllabus/SubTopic");


const VALID_TYPES     = ["writtenExam", "interview", "project", "presentation", "learning", "assessment"];
const VALID_PRIORITY  = ["low", "medium", "high"];


// POST /task-master/bulk-upload
// Body: { syllabusVersionId, tasks: [{ subject, topic, subTopic, taskTitle, taskType, maxMarks, cutoff, priority, mandatory, description }] }
exports.bulkUploadTasks = async (req, res) => {
  try {
    const { syllabusVersionId, tasks } = req.body;


    if (!syllabusVersionId) return res.status(400).json({ success: false, message: "syllabusVersionId is required" });
    if (!Array.isArray(tasks) || tasks.length === 0) return res.status(400).json({ success: false, message: "tasks array is required" });


    const syllabusVersion = await SyllabusVersion.findById(syllabusVersionId);
    if (!syllabusVersion) return res.status(404).json({ success: false, message: "SyllabusVersion not found" });


    const { levelId, subLevelId } = syllabusVersion;


    // Since one SyllabusVersion = one Subject, fetch it once
    const subjectDoc = await Subject.findOne({ syllabusVersionId });
    if (!subjectDoc) return res.status(404).json({ success: false, message: "No subject found for this SyllabusVersion" });


    const errors   = [];
    const taskDocs = [];


    for (let i = 0; i < tasks.length; i++) {
      const row = tasks[i];
      const rowNum = i + 2; // Excel row number (1=header)


      const topicName        = (row.topic            || "").trim();
      const subTopicName      = (row.subTopic         || "").trim();
      const taskTitle         = (row.taskTitle        || "").trim();
      const taskType          = (row.taskType         || "assessment").trim();
      const priority          = (row.priority         || "medium").trim();
      const maxMarks          = Number(row.maxMarks)  || 100;
      const cutoff            = Number(row.cutoff)    || 40;
      const mandatory         = row.mandatory !== "false" && row.mandatory !== false && row.mandatory !== "0";
      const description       = (row.description      || "").trim();
      const timeDays          = row.timeDays          ? Number(row.timeDays) : null;
      const measurablePoints  = (row.measurablePoints || "").trim() || null;


      // Validate required fields
      if (!topicName || !subTopicName || !taskTitle) {
        errors.push(`Row ${rowNum}: Topic, SubTopic, TaskTitle are required`);
        continue;
      }
      if (!VALID_TYPES.includes(taskType)) {
        errors.push(`Row ${rowNum}: Invalid TaskType "${taskType}". Allowed: ${VALID_TYPES.join(", ")}`);
        continue;
      }
      if (!VALID_PRIORITY.includes(priority)) {
        errors.push(`Row ${rowNum}: Invalid Priority "${priority}". Allowed: ${VALID_PRIORITY.join(", ")}`);
        continue;
      }


      const topicDoc = await Topic.findOne({ syllabusVersionId, subjectId: subjectDoc._id, name: new RegExp(`^${topicName}$`, "i") });
      if (!topicDoc) { errors.push(`Row ${rowNum}: Topic "${topicName}" not found`); continue; }


      const subTopicDoc = await SubTopic.findOne({ syllabusVersionId, topicId: topicDoc._id, name: new RegExp(`^${subTopicName}$`, "i") });
      if (!subTopicDoc) { errors.push(`Row ${rowNum}: SubTopic "${subTopicName}" not found under topic "${topicName}"`); continue; }


      const taskCode = `TM-${syllabusVersionId.toString().slice(-4)}-${topicDoc._id.toString().slice(-4)}-${subTopicDoc._id.toString().slice(-4)}-${Date.now().toString().slice(-4)}`;


      // Check duplicate taskCode
      const exists = await TaskMaster.findOne({ syllabusVersionId, subTopicId: subTopicDoc._id, title: taskTitle });
      if (exists) { errors.push(`Row ${rowNum}: Task "${taskTitle}" already exists for this subTopic`); continue; }


      taskDocs.push({
        syllabusVersionId,
        levelId,
        subLevelId,
        subjectId:        subjectDoc._id,
        topicId:          topicDoc._id,
        subTopicId:       subTopicDoc._id,
        taskCode,
        title:            taskTitle,
        description,
        type:             taskType,
        maxMarks,
        cutoff,
        mandatory,
        priority,
        timeDays,
        measurablePoints,
        originalTaskId:   subTopicDoc._id,
      });
    }


    if (taskDocs.length === 0) {
      return res.status(400).json({ success: false, message: "No valid tasks to insert", errors });
    }


    const inserted = await TaskMaster.insertMany(taskDocs);


    // Mark syllabusVersion as taskMasterGenerated
    await SyllabusVersion.findByIdAndUpdate(syllabusVersionId, {
      taskMasterGenerated: true,
      taskMasterGeneratedAt: new Date(),
    });


    res.status(201).json({
      success: true,
      message: `${inserted.length} task(s) created successfully`,
      inserted: inserted.length,
      skipped: errors.length,
      errors,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};