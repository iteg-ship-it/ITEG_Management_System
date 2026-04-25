const mongoose = require("mongoose");
const ExcelJS = require("exceljs");
const SyllabusVersion = require("../../models/syllabus/SyllabusVersion");
const {
  buildTaskEntries,
  syncSyllabusTasksToStudents
} = require("../../services/taskAssignmentService");

const normalizeSubjects = (subjects = []) =>
  subjects.map((subject, subjectIndex) => ({
    ...subject,
    order: subject.order || subjectIndex + 1,
    isActive: subject.isActive !== false,
    topics: (subject.topics || []).map((topic, topicIndex) => ({
      ...topic,
      order: topic.order || topicIndex + 1,
      isActive: topic.isActive !== false,
      tasks: (topic.tasks || []).map((task, taskIndex) => ({
        ...task,
        order: task.order || taskIndex + 1,
        isActive: task.isActive !== false
      })),
      subTopics: (topic.subTopics || []).map((subTopic, subTopicIndex) => ({
        ...subTopic,
        order: subTopic.order || subTopicIndex + 1,
        isActive: subTopic.isActive !== false,
        tasks: (subTopic.tasks || []).map((task, taskIndex) => ({
          ...task,
          order: task.order || taskIndex + 1,
          isActive: task.isActive !== false
        }))
      }))
    }))
  }));

const ensureObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

const getTaskCount = (syllabusVersion) => buildTaskEntries(syllabusVersion).length;

const syncIfActiveVersion = async (syllabusVersion) => {
  if (syllabusVersion.status !== "active" || getTaskCount(syllabusVersion) === 0) {
    return [];
  }

  return syncSyllabusTasksToStudents(syllabusVersion._id);
};

const getSubjectOrNull = (syllabusVersion, subjectId) =>
  ensureObjectId(subjectId) ? syllabusVersion.subjects.id(subjectId) : null;

const getTopicOrNull = (subject, topicId) =>
  subject && ensureObjectId(topicId) ? subject.topics.id(topicId) : null;

const getSubTopicOrNull = (topic, subTopicId) =>
  topic && ensureObjectId(subTopicId) ? topic.subTopics.id(subTopicId) : null;

const normalizeTaskItem = (task = {}, index = 0) => ({
  title: task.title,
  description: task.description || "",
  type: task.type || "assignment",
  mandatory: task.mandatory !== false,
  maxMarks: typeof task.maxMarks === "number" ? task.maxMarks : 5,
  order: typeof task.order === "number" ? task.order : index + 1,
  isActive: task.isActive !== false
});

const normalizeSubTopicItem = (subTopic = {}, index = 0) => ({
  name: subTopic.name,
  description: subTopic.description || "",
  order: typeof subTopic.order === "number" ? subTopic.order : index + 1,
  isActive: subTopic.isActive !== false,
  tasks: (subTopic.tasks || []).map((task, taskIndex) => normalizeTaskItem(task, taskIndex))
});

const normalizeTopicItem = (topic = {}, index = 0) => ({
  name: topic.name,
  description: topic.description || "",
  order: typeof topic.order === "number" ? topic.order : index + 1,
  isActive: topic.isActive !== false,
  tasks: (topic.tasks || []).map((task, taskIndex) => normalizeTaskItem(task, taskIndex)),
  subTopics: (topic.subTopics || []).map((subTopic, subTopicIndex) => normalizeSubTopicItem(subTopic, subTopicIndex))
});

const normalizeSubjectItem = (subject = {}, index = 0) => ({
  name: subject.name,
  code: subject.code || "",
  description: subject.description || "",
  order: typeof subject.order === "number" ? subject.order : index + 1,
  isActive: subject.isActive !== false,
  topics: (subject.topics || []).map((topic, topicIndex) => normalizeTopicItem(topic, topicIndex))
});

const validateSubjectUploadPayload = (subject) => {
  if (!subject || typeof subject !== "object") {
    throw new Error("subject must be a valid object");
  }

  if (!subject.name || typeof subject.name !== "string") {
    throw new Error("subject.name is required");
  }

  for (const topic of subject.topics || []) {
    if (!topic.name || typeof topic.name !== "string") {
      throw new Error("Each topic must have a name");
    }

    for (const task of topic.tasks || []) {
      if (!task.title || typeof task.title !== "string") {
        throw new Error("Each topic task must have a title");
      }
    }

    for (const subTopic of topic.subTopics || []) {
      if (!subTopic.name || typeof subTopic.name !== "string") {
        throw new Error("Each subTopic must have a name");
      }

      for (const task of subTopic.tasks || []) {
        if (!task.title || typeof task.title !== "string") {
          throw new Error("Each subTopic task must have a title");
        }
      }
    }
  }
};

const resolveMatchingSubject = (syllabusVersion, subjectPayload) => {
  if (ensureObjectId(subjectPayload.subjectId)) {
    return syllabusVersion.subjects.id(subjectPayload.subjectId);
  }

  if (subjectPayload.code) {
    return syllabusVersion.subjects.find((item) => item.code && item.code === subjectPayload.code) || null;
  }

  return syllabusVersion.subjects.find((item) => item.name === subjectPayload.name) || null;
};

const normalizeBoolean = (value, defaultValue = true) => {
  if (value === undefined || value === null || value === "") {
    return defaultValue;
  }

  if (typeof value === "boolean") {
    return value;
  }

  const normalized = String(value).trim().toLowerCase();
  if (["true", "yes", "1", "active", "mandatory"].includes(normalized)) {
    return true;
  }

  if (["false", "no", "0", "inactive", "optional"].includes(normalized)) {
    return false;
  }

  return defaultValue;
};

const normalizeNumber = (value, defaultValue) => {
  if (value === undefined || value === null || value === "") {
    return defaultValue;
  }

  const parsed = Number(value);
  return Number.isNaN(parsed) ? defaultValue : parsed;
};

const upsertSubjectTree = (syllabusVersion, inputSubjects) => {
  const uploadedSubjects = [];

  inputSubjects.forEach(validateSubjectUploadPayload);

  for (const [index, subjectPayload] of inputSubjects.entries()) {
    const normalizedSubject = normalizeSubjectItem(
      subjectPayload,
      typeof subjectPayload.order === "number" ? subjectPayload.order - 1 : syllabusVersion.subjects.length + index
    );

    const existingSubject = resolveMatchingSubject(syllabusVersion, subjectPayload);

    if (existingSubject) {
      existingSubject.name = normalizedSubject.name;
      existingSubject.code = normalizedSubject.code;
      existingSubject.description = normalizedSubject.description;
      existingSubject.order = normalizedSubject.order;
      existingSubject.isActive = normalizedSubject.isActive;
      existingSubject.topics = normalizedSubject.topics;
      uploadedSubjects.push({
        action: "updated",
        subjectId: existingSubject._id,
        name: existingSubject.name,
        code: existingSubject.code
      });
      continue;
    }

    syllabusVersion.subjects.push(normalizedSubject);
    const createdSubject = syllabusVersion.subjects[syllabusVersion.subjects.length - 1];
    uploadedSubjects.push({
      action: "created",
      subjectId: createdSubject._id,
      name: createdSubject.name,
      code: createdSubject.code
    });
  }

  return uploadedSubjects;
};

const parseSubjectUploadRows = (rows = []) => {
  const subjectMap = new Map();

  rows.forEach((row, index) => {
    const rowNumber = index + 2;
    const subjectName = row.subjectName?.trim();
    const topicName = row.topicName?.trim();
    const subTopicName = row.subTopicName?.trim();
    const taskTitle = row.taskTitle?.trim();
    const taskLevel = (row.taskLevel || (subTopicName ? "subTopic" : "topic")).trim().toLowerCase();

    if (!subjectName) {
      return;
    }

    if (!topicName) {
      throw new Error(`Row ${rowNumber}: topicName is required`);
    }

    if (!taskTitle) {
      throw new Error(`Row ${rowNumber}: taskTitle is required`);
    }

    const subjectKey = row.subjectCode?.trim() || subjectName;
    if (!subjectMap.has(subjectKey)) {
      subjectMap.set(subjectKey, {
        subjectId: row.subjectId?.trim() || undefined,
        name: subjectName,
        code: row.subjectCode?.trim() || "",
        description: row.subjectDescription?.trim() || "",
        order: normalizeNumber(row.subjectOrder, subjectMap.size + 1),
        isActive: normalizeBoolean(row.subjectActive, true),
        topics: []
      });
    }

    const subject = subjectMap.get(subjectKey);
    let topic = subject.topics.find((item) => item.name === topicName);
    if (!topic) {
      topic = {
        name: topicName,
        description: row.topicDescription?.trim() || "",
        order: normalizeNumber(row.topicOrder, subject.topics.length + 1),
        isActive: normalizeBoolean(row.topicActive, true),
        tasks: [],
        subTopics: []
      };
      subject.topics.push(topic);
    }

    const taskPayload = {
      title: taskTitle,
      description: row.taskDescription?.trim() || "",
      type: row.taskType?.trim() || "assignment",
      mandatory: normalizeBoolean(row.taskMandatory, true),
      maxMarks: normalizeNumber(row.taskMaxMarks, 5),
      order: normalizeNumber(
        row.taskOrder,
        taskLevel === "subtopic" && subTopicName
          ? 1
          : topic.tasks.length + 1
      ),
      isActive: normalizeBoolean(row.taskActive, true)
    };

    if (taskLevel === "subtopic") {
      if (!subTopicName) {
        throw new Error(`Row ${rowNumber}: subTopicName is required when taskLevel is subTopic`);
      }

      let subTopic = topic.subTopics.find((item) => item.name === subTopicName);
      if (!subTopic) {
        subTopic = {
          name: subTopicName,
          description: row.subTopicDescription?.trim() || "",
          order: normalizeNumber(row.subTopicOrder, topic.subTopics.length + 1),
          isActive: normalizeBoolean(row.subTopicActive, true),
          tasks: []
        };
        topic.subTopics.push(subTopic);
      }

      taskPayload.order = normalizeNumber(row.taskOrder, subTopic.tasks.length + 1);
      subTopic.tasks.push(taskPayload);
      return;
    }

    topic.tasks.push(taskPayload);
  });

  return Array.from(subjectMap.values());
};

const extractRowsFromWorksheet = (worksheet) => {
  const headers = [];
  const rows = [];

  worksheet.getRow(1).eachCell((cell, colNumber) => {
    headers[colNumber] = String(cell.value || "").trim();
  });

  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) {
      return;
    }

    const rowData = {};
    let hasValues = false;

    headers.forEach((header, colNumber) => {
      if (!header) {
        return;
      }

      const cellValue = row.getCell(colNumber).value;
      const normalizedValue = cellValue && typeof cellValue === "object" && cellValue.text !== undefined
        ? cellValue.text
        : cellValue;

      if (normalizedValue !== null && normalizedValue !== undefined && normalizedValue !== "") {
        hasValues = true;
      }

      rowData[header] = normalizedValue;
    });

    if (hasValues) {
      rows.push(rowData);
    }
  });

  return rows;
};

exports.createSyllabusVersion = async (req, res) => {
  try {
    const { sessionId, levelId, subLevelId, version, title, subjects } = req.body;

    if (!sessionId || !levelId || !subLevelId || !version) {
      return res.status(400).json({
        success: false,
        message: "sessionId, levelId, subLevelId and version are required"
      });
    }

    if (!Array.isArray(subjects) || subjects.length === 0) {
      return res.status(400).json({
        success: false,
        message: "subjects must be a non-empty array"
      });
    }

    const syllabusVersion = await SyllabusVersion.create({
      sessionId,
      levelId,
      subLevelId,
      version,
      title: title || "",
      subjects: normalizeSubjects(subjects)
    });

    res.status(201).json({
      success: true,
      message: "Syllabus version created successfully",
      data: {
        ...syllabusVersion.toObject(),
        taskCount: getTaskCount(syllabusVersion)
      }
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "This syllabus version already exists for the selected session/level/sublevel"
      });
    }

    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

exports.getAllSyllabusVersions = async (req, res) => {
  try {
    const { sessionId, levelId, subLevelId, status } = req.query;
    const filter = { isActive: true };

    if (sessionId) filter.sessionId = sessionId;
    if (levelId) filter.levelId = levelId;
    if (subLevelId) filter.subLevelId = subLevelId;
    if (status) filter.status = status;

    const syllabusVersions = await SyllabusVersion.find(filter)
      .populate("sessionId", "name")
      .populate("levelId", "name order")
      .populate("subLevelId", "name order")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: syllabusVersions.length,
      data: syllabusVersions.map((item) => ({
        ...item.toObject(),
        taskCount: getTaskCount(item)
      }))
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getSyllabusVersionById = async (req, res) => {
  try {
    const syllabusVersion = await SyllabusVersion.findById(req.params.id)
      .populate("sessionId", "name")
      .populate("levelId", "name order")
      .populate("subLevelId", "name order");

    if (!syllabusVersion || !syllabusVersion.isActive) {
      return res.status(404).json({
        success: false,
        message: "Syllabus version not found"
      });
    }

    res.status(200).json({
      success: true,
      data: {
        ...syllabusVersion.toObject(),
        taskCount: getTaskCount(syllabusVersion)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.updateDraftSyllabusVersion = async (req, res) => {
  try {
    const syllabusVersion = await SyllabusVersion.findById(req.params.id);

    if (!syllabusVersion || !syllabusVersion.isActive) {
      return res.status(404).json({
        success: false,
        message: "Syllabus version not found"
      });
    }

    if (syllabusVersion.status !== "draft") {
      return res.status(400).json({
        success: false,
        message: "Only draft syllabus versions can be updated directly"
      });
    }

    if (req.body.title !== undefined) {
      syllabusVersion.title = req.body.title;
    }

    if (req.body.subjects !== undefined) {
      if (!Array.isArray(req.body.subjects) || req.body.subjects.length === 0) {
        return res.status(400).json({
          success: false,
          message: "subjects must be a non-empty array"
        });
      }

      syllabusVersion.subjects = normalizeSubjects(req.body.subjects);
    }

    await syllabusVersion.save();

    res.status(200).json({
      success: true,
      message: "Draft syllabus updated successfully",
      data: {
        ...syllabusVersion.toObject(),
        taskCount: getTaskCount(syllabusVersion)
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

exports.activateSyllabusVersion = async (req, res) => {
  try {
    const syllabusVersion = await SyllabusVersion.findById(req.params.id);

    if (!syllabusVersion || !syllabusVersion.isActive) {
      return res.status(404).json({
        success: false,
        message: "Syllabus version not found"
      });
    }

    await SyllabusVersion.updateMany(
      {
        sessionId: syllabusVersion.sessionId,
        levelId: syllabusVersion.levelId,
        subLevelId: syllabusVersion.subLevelId,
        status: "active",
        _id: { $ne: syllabusVersion._id }
      },
      { $set: { status: "archived" } }
    );

    syllabusVersion.status = "active";
    await syllabusVersion.save();

    res.status(200).json({
      success: true,
      message: "Syllabus version activated successfully",
      data: syllabusVersion
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.archiveSyllabusVersion = async (req, res) => {
  try {
    const syllabusVersion = await SyllabusVersion.findById(req.params.id);

    if (!syllabusVersion || !syllabusVersion.isActive) {
      return res.status(404).json({
        success: false,
        message: "Syllabus version not found"
      });
    }

    syllabusVersion.status = "archived";
    await syllabusVersion.save();

    res.status(200).json({
      success: true,
      message: "Syllabus version archived successfully",
      data: syllabusVersion
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.addTaskToSyllabusVersion = async (req, res) => {
  try {
    const { subjectId, topicId, subTopicId, title, description, type, mandatory, maxMarks } = req.body;

    if (!ensureObjectId(subjectId) || !ensureObjectId(topicId) || !title) {
      return res.status(400).json({
        success: false,
        message: "subjectId, topicId and title are required"
      });
    }

    const syllabusVersion = await SyllabusVersion.findById(req.params.id);

    if (!syllabusVersion || !syllabusVersion.isActive) {
      return res.status(404).json({
        success: false,
        message: "Syllabus version not found"
      });
    }

    const subject = syllabusVersion.subjects.id(subjectId);
    const topic = subject && subject.topics.id(topicId);
    const subTopic = subTopicId && topic ? topic.subTopics.id(subTopicId) : null;

    if (!topic) {
      return res.status(404).json({
        success: false,
        message: "Subject/topic combination not found"
      });
    }

    if (subTopicId && !subTopic) {
      return res.status(404).json({
        success: false,
        message: "Subject/topic/subtopic combination not found"
      });
    }

    const taskList = subTopic ? subTopic.tasks : topic.tasks;
    const nextOrder = taskList.length + 1;

    taskList.push({
      title,
      description: description || "",
      type: type || "assignment",
      mandatory: mandatory !== false,
      maxMarks: typeof maxMarks === "number" ? maxMarks : 5,
      order: nextOrder,
      isActive: true
    });

    await syllabusVersion.save();

    const syncResults = await syncIfActiveVersion(syllabusVersion);

    res.status(201).json({
      success: true,
      message: "Task added successfully",
      data: {
        syllabusVersionId: syllabusVersion._id,
        taskNodeType: subTopic ? "subTopic" : "topic",
        task: taskList[taskList.length - 1],
        syncedStudents: syncResults.filter((item) => item.success).length
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

exports.toggleTaskActive = async (req, res) => {
  try {
    const { isActive } = req.body;
    const syllabusVersion = await SyllabusVersion.findById(req.params.id);

    if (!syllabusVersion || !syllabusVersion.isActive) {
      return res.status(404).json({
        success: false,
        message: "Syllabus version not found"
      });
    }

    const taskId = req.params.taskId;
    let matchedTask = null;

    for (const subject of syllabusVersion.subjects) {
      for (const topic of subject.topics) {
        const topicTask = topic.tasks.id(taskId);
        if (topicTask) {
          matchedTask = topicTask;
          break;
        }

        for (const subTopic of topic.subTopics) {
          const task = subTopic.tasks.id(taskId);
          if (task) {
            matchedTask = task;
            break;
          }
        }
        if (matchedTask) break;
      }
      if (matchedTask) break;
    }

    if (!matchedTask) {
      return res.status(404).json({
        success: false,
        message: "Task not found in syllabus version"
      });
    }

    matchedTask.isActive = Boolean(isActive);
    await syllabusVersion.save();

    const syncResults = await syncIfActiveVersion(syllabusVersion);

    res.status(200).json({
      success: true,
      message: "Task visibility updated successfully",
      data: {
        task: matchedTask,
        syncedStudents: syncResults.filter((item) => item.success).length
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

exports.addSubjectToSyllabusVersion = async (req, res) => {
  try {
    const { name, code, description, order, isActive } = req.body;
    if (!name) {
      return res.status(400).json({
        success: false,
        message: "name is required"
      });
    }

    const syllabusVersion = await SyllabusVersion.findById(req.params.id);
    if (!syllabusVersion || !syllabusVersion.isActive) {
      return res.status(404).json({
        success: false,
        message: "Syllabus version not found"
      });
    }

    syllabusVersion.subjects.push({
      name,
      code: code || "",
      description: description || "",
      order: typeof order === "number" ? order : syllabusVersion.subjects.length + 1,
      isActive: isActive !== false,
      topics: []
    });

    await syllabusVersion.save();
    const syncResults = await syncIfActiveVersion(syllabusVersion);

    res.status(201).json({
      success: true,
      message: "Subject added successfully",
      data: {
        subject: syllabusVersion.subjects[syllabusVersion.subjects.length - 1],
        syncedStudents: syncResults.filter((item) => item.success).length
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

exports.updateSubjectInSyllabusVersion = async (req, res) => {
  try {
    const syllabusVersion = await SyllabusVersion.findById(req.params.id);
    if (!syllabusVersion || !syllabusVersion.isActive) {
      return res.status(404).json({
        success: false,
        message: "Syllabus version not found"
      });
    }

    const subject = getSubjectOrNull(syllabusVersion, req.params.subjectId);
    if (!subject) {
      return res.status(404).json({
        success: false,
        message: "Subject not found"
      });
    }

    const allowedFields = ["name", "code", "description", "order", "isActive"];
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        subject[field] = req.body[field];
      }
    }

    await syllabusVersion.save();
    const syncResults = await syncIfActiveVersion(syllabusVersion);

    res.status(200).json({
      success: true,
      message: "Subject updated successfully",
      data: {
        subject,
        syncedStudents: syncResults.filter((item) => item.success).length
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

exports.toggleSubjectActive = async (req, res) => {
  try {
    const syllabusVersion = await SyllabusVersion.findById(req.params.id);
    if (!syllabusVersion || !syllabusVersion.isActive) {
      return res.status(404).json({
        success: false,
        message: "Syllabus version not found"
      });
    }

    const subject = getSubjectOrNull(syllabusVersion, req.params.subjectId);
    if (!subject) {
      return res.status(404).json({
        success: false,
        message: "Subject not found"
      });
    }

    subject.isActive = Boolean(req.body.isActive);
    await syllabusVersion.save();
    const syncResults = await syncIfActiveVersion(syllabusVersion);

    res.status(200).json({
      success: true,
      message: "Subject status updated successfully",
      data: {
        subject,
        syncedStudents: syncResults.filter((item) => item.success).length
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

exports.addTopicToSyllabusVersion = async (req, res) => {
  try {
    const { name, description, order, isActive } = req.body;
    if (!name) {
      return res.status(400).json({
        success: false,
        message: "name is required"
      });
    }

    const syllabusVersion = await SyllabusVersion.findById(req.params.id);
    if (!syllabusVersion || !syllabusVersion.isActive) {
      return res.status(404).json({
        success: false,
        message: "Syllabus version not found"
      });
    }

    const subject = getSubjectOrNull(syllabusVersion, req.params.subjectId);
    if (!subject) {
      return res.status(404).json({
        success: false,
        message: "Subject not found"
      });
    }

    subject.topics.push({
      name,
      description: description || "",
      order: typeof order === "number" ? order : subject.topics.length + 1,
      isActive: isActive !== false,
      tasks: [],
      subTopics: []
    });

    await syllabusVersion.save();
    const syncResults = await syncIfActiveVersion(syllabusVersion);

    res.status(201).json({
      success: true,
      message: "Topic added successfully",
      data: {
        topic: subject.topics[subject.topics.length - 1],
        syncedStudents: syncResults.filter((item) => item.success).length
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

exports.updateTopicInSyllabusVersion = async (req, res) => {
  try {
    const syllabusVersion = await SyllabusVersion.findById(req.params.id);
    if (!syllabusVersion || !syllabusVersion.isActive) {
      return res.status(404).json({
        success: false,
        message: "Syllabus version not found"
      });
    }

    const subject = getSubjectOrNull(syllabusVersion, req.params.subjectId);
    const topic = getTopicOrNull(subject, req.params.topicId);
    if (!topic) {
      return res.status(404).json({
        success: false,
        message: "Topic not found"
      });
    }

    const allowedFields = ["name", "description", "order", "isActive"];
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        topic[field] = req.body[field];
      }
    }

    await syllabusVersion.save();
    const syncResults = await syncIfActiveVersion(syllabusVersion);

    res.status(200).json({
      success: true,
      message: "Topic updated successfully",
      data: {
        topic,
        syncedStudents: syncResults.filter((item) => item.success).length
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

exports.toggleTopicActive = async (req, res) => {
  try {
    const syllabusVersion = await SyllabusVersion.findById(req.params.id);
    if (!syllabusVersion || !syllabusVersion.isActive) {
      return res.status(404).json({
        success: false,
        message: "Syllabus version not found"
      });
    }

    const subject = getSubjectOrNull(syllabusVersion, req.params.subjectId);
    const topic = getTopicOrNull(subject, req.params.topicId);
    if (!topic) {
      return res.status(404).json({
        success: false,
        message: "Topic not found"
      });
    }

    topic.isActive = Boolean(req.body.isActive);
    await syllabusVersion.save();
    const syncResults = await syncIfActiveVersion(syllabusVersion);

    res.status(200).json({
      success: true,
      message: "Topic status updated successfully",
      data: {
        topic,
        syncedStudents: syncResults.filter((item) => item.success).length
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

exports.addSubTopicToSyllabusVersion = async (req, res) => {
  try {
    const { name, description, order, isActive } = req.body;
    if (!name) {
      return res.status(400).json({
        success: false,
        message: "name is required"
      });
    }

    const syllabusVersion = await SyllabusVersion.findById(req.params.id);
    if (!syllabusVersion || !syllabusVersion.isActive) {
      return res.status(404).json({
        success: false,
        message: "Syllabus version not found"
      });
    }

    const subject = getSubjectOrNull(syllabusVersion, req.params.subjectId);
    const topic = getTopicOrNull(subject, req.params.topicId);
    if (!topic) {
      return res.status(404).json({
        success: false,
        message: "Topic not found"
      });
    }

    topic.subTopics.push({
      name,
      description: description || "",
      order: typeof order === "number" ? order : topic.subTopics.length + 1,
      isActive: isActive !== false,
      tasks: []
    });

    await syllabusVersion.save();
    const syncResults = await syncIfActiveVersion(syllabusVersion);

    res.status(201).json({
      success: true,
      message: "SubTopic added successfully",
      data: {
        subTopic: topic.subTopics[topic.subTopics.length - 1],
        syncedStudents: syncResults.filter((item) => item.success).length
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

exports.updateSubTopicInSyllabusVersion = async (req, res) => {
  try {
    const syllabusVersion = await SyllabusVersion.findById(req.params.id);
    if (!syllabusVersion || !syllabusVersion.isActive) {
      return res.status(404).json({
        success: false,
        message: "Syllabus version not found"
      });
    }

    const subject = getSubjectOrNull(syllabusVersion, req.params.subjectId);
    const topic = getTopicOrNull(subject, req.params.topicId);
    const subTopic = getSubTopicOrNull(topic, req.params.subTopicId);
    if (!subTopic) {
      return res.status(404).json({
        success: false,
        message: "SubTopic not found"
      });
    }

    const allowedFields = ["name", "description", "order", "isActive"];
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        subTopic[field] = req.body[field];
      }
    }

    await syllabusVersion.save();
    const syncResults = await syncIfActiveVersion(syllabusVersion);

    res.status(200).json({
      success: true,
      message: "SubTopic updated successfully",
      data: {
        subTopic,
        syncedStudents: syncResults.filter((item) => item.success).length
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

exports.toggleSubTopicActive = async (req, res) => {
  try {
    const syllabusVersion = await SyllabusVersion.findById(req.params.id);
    if (!syllabusVersion || !syllabusVersion.isActive) {
      return res.status(404).json({
        success: false,
        message: "Syllabus version not found"
      });
    }

    const subject = getSubjectOrNull(syllabusVersion, req.params.subjectId);
    const topic = getTopicOrNull(subject, req.params.topicId);
    const subTopic = getSubTopicOrNull(topic, req.params.subTopicId);
    if (!subTopic) {
      return res.status(404).json({
        success: false,
        message: "SubTopic not found"
      });
    }

    subTopic.isActive = Boolean(req.body.isActive);
    await syllabusVersion.save();
    const syncResults = await syncIfActiveVersion(syllabusVersion);

    res.status(200).json({
      success: true,
      message: "SubTopic status updated successfully",
      data: {
        subTopic,
        syncedStudents: syncResults.filter((item) => item.success).length
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

exports.uploadSubjectWiseSyllabus = async (req, res) => {
  try {
    const syllabusVersion = await SyllabusVersion.findById(req.params.id);
    if (!syllabusVersion || !syllabusVersion.isActive) {
      return res.status(404).json({
        success: false,
        message: "Syllabus version not found"
      });
    }

    const inputSubjects = Array.isArray(req.body.subjects)
      ? req.body.subjects
      : req.body.subject
        ? [req.body.subject]
        : [];

    if (inputSubjects.length === 0) {
      return res.status(400).json({
        success: false,
        message: "subject or subjects payload is required"
      });
    }

    const uploadedSubjects = upsertSubjectTree(syllabusVersion, inputSubjects);

    await syllabusVersion.save();
    const syncResults = await syncIfActiveVersion(syllabusVersion);

    res.status(200).json({
      success: true,
      message: "Subject-wise syllabus uploaded successfully",
      data: {
        syllabusVersionId: syllabusVersion._id,
        uploadedSubjects,
        syncedStudents: syncResults.filter((item) => item.success).length,
        taskCount: getTaskCount(syllabusVersion)
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

exports.uploadSubjectWiseSyllabusExcel = async (req, res) => {
  try {
    if (!req.file?.buffer) {
      return res.status(400).json({
        success: false,
        message: "Excel file is required"
      });
    }

    const syllabusVersion = await SyllabusVersion.findById(req.params.id);
    if (!syllabusVersion || !syllabusVersion.isActive) {
      return res.status(404).json({
        success: false,
        message: "Syllabus version not found"
      });
    }

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(req.file.buffer);

    const worksheet = workbook.worksheets[0];
    if (!worksheet) {
      return res.status(400).json({
        success: false,
        message: "Excel sheet is empty"
      });
    }

    const rows = extractRowsFromWorksheet(worksheet);
    if (rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Excel file does not contain data rows"
      });
    }

    const subjects = parseSubjectUploadRows(rows);
    if (subjects.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid subject rows found in excel file"
      });
    }

    const uploadedSubjects = upsertSubjectTree(syllabusVersion, subjects);
    await syllabusVersion.save();
    const syncResults = await syncIfActiveVersion(syllabusVersion);

    res.status(200).json({
      success: true,
      message: "Excel syllabus uploaded successfully",
      data: {
        syllabusVersionId: syllabusVersion._id,
        uploadedSubjects,
        syncedStudents: syncResults.filter((item) => item.success).length,
        taskCount: getTaskCount(syllabusVersion),
        rowsProcessed: rows.length
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};
