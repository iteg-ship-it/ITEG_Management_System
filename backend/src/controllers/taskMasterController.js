const TaskMaster = require("../models/TaskMaster");

exports.createTask = async (req, res) => {
  try {
    const task = await TaskMaster.create(req.body);
    res.status(201).json({ message: "Task created successfully", task });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "Task code already exists" });
    }
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const task = await TaskMaster.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate("syllabusVersionId levelId subLevelId subjectId topicId subTopicId");

    if (!task) return res.status(404).json({ message: "Task not found" });

    res.status(200).json({ message: "Task updated successfully", task });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getTaskById = async (req, res) => {
  try {
    const task = await TaskMaster.findById(req.params.id).populate(
      "syllabusVersionId levelId subLevelId subjectId topicId subTopicId"
    );

    if (!task) return res.status(404).json({ message: "Task not found" });

    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getAllTasks = async (req, res) => {
  try {
    const { levelId, subLevelId, subjectId, type, priority, isActive } = req.query;

    const filter = {};
    if (levelId) filter.levelId = levelId;
    if (subLevelId) filter.subLevelId = subLevelId;
    if (subjectId) filter.subjectId = subjectId;
    if (type) filter.type = type;
    if (priority) filter.priority = priority;
    if (isActive !== undefined) filter.isActive = isActive === "true";

    const tasks = await TaskMaster.find(filter)
      .populate("syllabusVersionId levelId subLevelId subjectId topicId subTopicId")
      .sort({ createdAt: -1 });

    res.status(200).json({ total: tasks.length, tasks });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
