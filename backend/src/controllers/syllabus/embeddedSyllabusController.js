const mongoose = require("mongoose");
const SyllabusVersion = require("../../models/syllabus/SyllabusVersion");
const StudentTask = require("../../models/syllabus/StudentTask");
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

    let syncResults = [];
    if (syllabusVersion.status === "active") {
      syncResults = await syncSyllabusTasksToStudents(syllabusVersion._id);
    }

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

    await StudentTask.updateMany(
      {
        syllabusVersionId: syllabusVersion._id,
        taskId: matchedTask._id
      },
      { $set: { isActive: Boolean(isActive) } }
    );

    res.status(200).json({
      success: true,
      message: "Task visibility updated successfully",
      data: matchedTask
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};
