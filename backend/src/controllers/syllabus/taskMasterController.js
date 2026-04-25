const TaskMaster = require("../../models/syllabus/taskMaster");

exports.createTask = async (req, res) => {
  try {
    const { topicId, subTopicId, title, syllabusVersionId } = req.body;

    if (!topicId && !subTopicId)
      return res.status(400).json({ success: false, message: "Either topicId or subTopicId is required" });
    if (topicId && subTopicId)
      return res.status(400).json({ success: false, message: "Task must be linked to either Topic OR SubTopic, not both" });

    // Duplicate check
    const dupFilter = { syllabusVersionId, title };
    if (subTopicId) {
      dupFilter.subTopicId = subTopicId;
    } else {
      dupFilter.topicId    = topicId;
      dupFilter.subTopicId = { $in: [null, undefined] };
    }
    const exists = await TaskMaster.findOne(dupFilter);
    if (exists) return res.status(400).json({ success: false, message: "Task with this title already exists" });

    // Ensure subTopicId is not saved when not provided
    const payload = { ...req.body };
    if (!subTopicId) delete payload.subTopicId;

    const task = await TaskMaster.create(payload);
    res.status(201).json({ success: true, data: task });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
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
    const task = await TaskMaster.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
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
