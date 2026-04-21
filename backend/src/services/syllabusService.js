const SyllabusVersion = require("../models/syllabus/SyllabusVersion");
const TaskMaster = require("../models/syllabus/TaskMaster");

/**
 * ==================== STEP 1: CREATE SYLLABUS WITH EMBEDDED TASKS ====================
 * Admin creates syllabus with tasks embedded in structure
 */
async function createSyllabusWithTasks(syllabusData) {
  const syllabus = await SyllabusVersion.create({
    ...syllabusData,
    status: "draft",
    taskMasterGenerated: false
  });

  return syllabus;
}

/**
 * ==================== STEP 2: GENERATE TASK MASTER FROM SYLLABUS ====================
 * Extract all tasks from syllabus and create TaskMaster records
 * This happens when syllabus is approved/activated
 */
async function generateTaskMasterFromSyllabus(syllabusVersionId) {
  const syllabus = await SyllabusVersion.findById(syllabusVersionId);
  if (!syllabus) throw new Error("Syllabus not found");

  if (syllabus.taskMasterGenerated) {
    throw new Error("TaskMaster already generated for this syllabus");
  }

  const taskMasterRecords = [];

  // Extract all tasks from syllabus structure
  syllabus.subjects.forEach(subject => {
    subject.topics.forEach(topic => {
      
      // Topic-level tasks
      topic.tasks.forEach(task => {
        taskMasterRecords.push({
          syllabusVersionId: syllabus._id,
          subjectName: subject.subjectName,
          topicName: topic.topicName,
          subTopicName: null, // Topic level
          title: task.title,
          description: task.description,
          type: task.type,
          maxMarks: task.maxMarks,
          cutoff: task.cutoff,
          mandatory: task.mandatory,
          priority: task.priority,
          dueDate: task.dueDate,
          originalTaskId: task._id,
          isActive: true
        });
      });

      // SubTopic-level tasks
      topic.subTopics.forEach(subTopic => {
        subTopic.tasks.forEach(task => {
          taskMasterRecords.push({
            syllabusVersionId: syllabus._id,
            subjectName: subject.subjectName,
            topicName: topic.topicName,
            subTopicName: subTopic.subTopicName,
            title: task.title,
            description: task.description,
            type: task.type,
            maxMarks: task.maxMarks,
            cutoff: task.cutoff,
            mandatory: task.mandatory,
            priority: task.priority,
            dueDate: task.dueDate,
            originalTaskId: task._id,
            isActive: true
          });
        });
      });
    });
  });

  // Bulk insert TaskMaster records
  const result = await TaskMaster.insertMany(taskMasterRecords, { ordered: false });

  // Mark syllabus as TaskMaster generated
  syllabus.taskMasterGenerated = true;
  syllabus.taskMasterGeneratedAt = new Date();
  await syllabus.save();

  return {
    syllabusVersionId: syllabus._id,
    taskMasterCount: result.length,
    taskMasters: result
  };
}

/**
 * ==================== APPROVE AND ACTIVATE SYLLABUS ====================
 * Changes status and generates TaskMaster
 */
async function approveSyllabus(syllabusVersionId) {
  const syllabus = await SyllabusVersion.findById(syllabusVersionId);
  if (!syllabus) throw new Error("Syllabus not found");

  if (syllabus.status !== "draft") {
    throw new Error("Only draft syllabus can be approved");
  }

  // Generate TaskMaster
  const taskMasterResult = await generateTaskMasterFromSyllabus(syllabusVersionId);

  // Update status
  syllabus.status = "approved";
  await syllabus.save();

  return {
    syllabus,
    taskMasterResult
  };
}

/**
 * ==================== ACTIVATE SYLLABUS ====================
 * Makes syllabus active for student assignment
 */
async function activateSyllabus(syllabusVersionId) {
  const syllabus = await SyllabusVersion.findById(syllabusVersionId);
  if (!syllabus) throw new Error("Syllabus not found");

  if (syllabus.status !== "approved") {
    throw new Error("Only approved syllabus can be activated");
  }

  if (!syllabus.taskMasterGenerated) {
    throw new Error("TaskMaster must be generated before activation");
  }

  syllabus.status = "active";
  await syllabus.save();

  return syllabus;
}

/**
 * ==================== GET SYLLABUS WITH TASK COUNT ====================
 */
async function getSyllabusWithTaskCount(syllabusVersionId) {
  const syllabus = await SyllabusVersion.findById(syllabusVersionId)
    .populate("sessionId levelId subLevelId");

  if (!syllabus) throw new Error("Syllabus not found");

  const taskCount = await TaskMaster.countDocuments({ 
    syllabusVersionId, 
    isActive: true 
  });

  return {
    syllabus,
    taskCount
  };
}

module.exports = {
  createSyllabusWithTasks,
  generateTaskMasterFromSyllabus,
  approveSyllabus,
  activateSyllabus,
  getSyllabusWithTaskCount
};
