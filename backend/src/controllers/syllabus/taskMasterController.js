const TaskMaster = require("../../models/syllabus/taskMaster");
const Topic      = require("../../models/syllabus/Topic");
const SubTopic   = require("../../models/syllabus/SubTopic");

exports.createTask = async (req, res) => {
  try {
    const { topicId, subTopicId, subjectId, syllabusVersionId, title } = req.body;

    if (!subjectId)             return res.status(400).json({ success: false, message: "subjectId is required" });
    if (!topicId && !subTopicId) return res.status(400).json({ success: false, message: "Either topicId or subTopicId is required" });
    if (!title?.trim())          return res.status(400).json({ success: false, message: "Task title is required" });

    let resolvedTopicId = topicId;

    if (subTopicId) {
      const subTopic = await SubTopic.findById(subTopicId);
      if (!subTopic) return res.status(404).json({ success: false, message: "SubTopic not found" });
      if (String(subTopic.subjectId) !== String(subjectId))
        return res.status(400).json({ success: false, message: "SubTopic does not belong to selected Subject" });
      resolvedTopicId = subTopic.topicId;
    } else {
      const topic = await Topic.findById(topicId);
      if (!topic) return res.status(404).json({ success: false, message: "Topic not found" });
      if (String(topic.subjectId) !== String(subjectId))
        return res.status(400).json({ success: false, message: "Topic does not belong to selected Subject" });
    }

    // Duplicate check
    const dupFilter = { syllabusVersionId, title: title.trim() };
    if (subTopicId) dupFilter.subTopicId = subTopicId;
    else            { dupFilter.topicId = resolvedTopicId; dupFilter.subTopicId = { $in: [null, undefined] }; }

    const exists = await TaskMaster.findOne(dupFilter);
    if (exists) return res.status(400).json({ success: false, message: "Task with this title already exists" });

    const payload = {
      ...req.body,
      title:   title.trim(),
      topicId: resolvedTopicId,
    };
    if (!subTopicId) delete payload.subTopicId;

    const task = await TaskMaster.create(payload);
    res.status(201).json({ success: true, data: task });
  } catch (error) {
    console.error("createTask error:", error.message);
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getTasksByTopic = async (req, res) => {
  try {
    const tasks = await TaskMaster.find({
      topicId: req.params.topicId,
      subTopicId: { $in: [null, undefined] },
      isActive: true
    })
      .populate("subjectId", "name code")
      .populate("topicId", "name")
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: tasks.length, data: tasks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getTasksBySubTopic = async (req, res) => {
  try {
    const tasks = await TaskMaster.find({ subTopicId: req.params.subTopicId, isActive: true })
      .populate("subjectId", "name code")
      .populate("topicId", "name")
      .populate("subTopicId", "name")
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: tasks.length, data: tasks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const task = await TaskMaster.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!task) return res.status(404).json({ success: false, message: "Task not found" });
    res.status(200).json({ success: true, data: task });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getTaskById = async (req, res) => {
  try {
    const task = await TaskMaster.findById(req.params.id)
      .populate("syllabusVersionId subjectId topicId subTopicId");
    if (!task) return res.status(404).json({ success: false, message: "Task not found" });
    res.status(200).json({ success: true, data: task });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAllTasks = async (req, res) => {
  try {
    const { syllabusVersionId, subjectId, topicId, subTopicId, type, priority, isActive } = req.query;
    const filter = {};
    if (syllabusVersionId) filter.syllabusVersionId = syllabusVersionId;
    if (subjectId)         filter.subjectId         = subjectId;
    if (topicId)           filter.topicId           = topicId;
    if (subTopicId)        filter.subTopicId        = subTopicId;
    if (type)              filter.type              = type;
    if (priority)          filter.priority          = priority;
    if (isActive !== undefined) filter.isActive     = isActive === "true";

    const tasks = await TaskMaster.find(filter)
      .populate("syllabusVersionId subjectId topicId subTopicId")
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, total: tasks.length, data: tasks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const task = await TaskMaster.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!task) return res.status(404).json({ success: false, message: "Task not found" });
    res.status(200).json({ success: true, message: "Task deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
