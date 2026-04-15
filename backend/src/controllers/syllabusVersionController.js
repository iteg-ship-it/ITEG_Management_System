const SyllabusVersion = require("../models/SyllabusVersion");
const Subject    = require("../models/syllabus/Subject");
const Topic      = require("../models/syllabus/Topic");
const SubTopic   = require("../models/syllabus/SubTopic");
const Session    = require("../models/Session");
const TaskMaster = require("../models/TaskMaster");
const mongoose   = require("mongoose");

// ==================== CREATE ====================
// Body: { sessionName, levelId, subLevelId, version, hierarchy }
// hierarchy: [{ subject, topics: [{ topic, subTopics: [] }] }]
// Each subject in hierarchy creates ONE SyllabusVersion document
exports.createSyllabusVersion = async (req, res) => {
  const dbSession = await mongoose.startSession();
  dbSession.startTransaction();
  try {
    const { sessionName, sessionId: sessionIdDirect, levelId, subLevelId, version, hierarchy } = req.body;

    if (!levelId || !subLevelId || !version) {
      return res.status(400).json({ success: false, message: "levelId, subLevelId and version are required" });
    }
    if (!sessionName && !sessionIdDirect) {
      return res.status(400).json({ success: false, message: "Session not found in Excel. Add a 'Session' column." });
    }
    if (!Array.isArray(hierarchy) || hierarchy.length === 0) {
      return res.status(400).json({ success: false, message: "hierarchy data is required" });
    }

    // Find or create session
    let sessionId = sessionIdDirect;
    if (!sessionId && sessionName) {
      let sessionDoc = await Session.findOne({ name: sessionName.trim() });
      if (!sessionDoc) {
        [sessionDoc] = await Session.create([{ name: sessionName.trim() }], { session: dbSession });
      }
      sessionId = sessionDoc._id;
    }

    const createdVersions = [];

    // One SyllabusVersion per subject
    for (const [sIdx, sItem] of hierarchy.entries()) {
      if (!sItem.subject) continue;

      const subjectName = sItem.subject.trim();

      // Create SyllabusVersion for this subject
      const [sv] = await SyllabusVersion.create(
        [{ sessionId, levelId, subLevelId, subjectName, version }],
        { session: dbSession }
      );
      const svId = sv._id;

      const subjectIds  = [];
      const topicIds    = [];
      const subTopicIds = [];

      // Create the Subject doc
      const code = `S${String(sIdx + 1).padStart(3, "0")}-${svId.toString().slice(-4)}`;
      const [subjectDoc] = await Subject.create(
        [{ name: subjectName, code, syllabusVersionId: svId }],
        { session: dbSession }
      );
      subjectIds.push(subjectDoc._id);

      for (const [tIdx, tItem] of (sItem.topics || []).entries()) {
        if (!tItem.topic) continue;
        const [topicDoc] = await Topic.create(
          [{ name: tItem.topic, syllabusVersionId: svId, subjectId: subjectDoc._id, order: tIdx + 1 }],
          { session: dbSession }
        );
        topicIds.push(topicDoc._id);

        for (const [stIdx, stRaw] of (tItem.subTopics || []).entries()) {
          if (!stRaw) continue;
          const stName = typeof stRaw === "object" ? stRaw.name : stRaw;
          if (!stName) continue;
          const [stDoc] = await SubTopic.create(
            [{ name: stName, syllabusVersionId: svId, topicId: topicDoc._id, subjectId: subjectDoc._id, order: stIdx + 1 }],
            { session: dbSession }
          );
          subTopicIds.push(stDoc._id);
        }
      }

      await SyllabusVersion.findByIdAndUpdate(
        svId,
        { subjectIds, topicIds, subTopicIds },
        { session: dbSession }
      );

      // ── Auto-generate TaskMaster entries from task fields in hierarchy ──
      const taskDocs = [];
      for (const tItem of (sItem.topics || [])) {
        if (!tItem.topic) continue;
        const topicDoc = topicIds.length
          ? await Topic.findOne({ name: tItem.topic, syllabusVersionId: svId }).session(dbSession)
          : null;
        if (!topicDoc) continue;

        const subTopicsWithTasks = (tItem.subTopics || []).filter(
          (st) => typeof st === "object" && st.taskTitle
        );

        for (const st of subTopicsWithTasks) {
          const stDoc = await SubTopic.findOne({ name: st.name, topicId: topicDoc._id }).session(dbSession);
          if (!stDoc) continue;

          const taskCode = `TM-${svId.toString().slice(-4)}-${topicDoc._id.toString().slice(-4)}-${stDoc._id.toString().slice(-4)}`;

          taskDocs.push({
            syllabusVersionId: svId,
            levelId,
            subLevelId,
            subjectId: subjectDoc._id,
            topicId:   topicDoc._id,
            subTopicId: stDoc._id,
            taskCode,
            title:       st.taskTitle,
            description: st.taskDescription || "",
            type:        st.taskType        || "assessment",
            maxMarks:    Number(st.maxMarks) || 100,
            cutoff:      Number(st.cutoff)   || 40,
            mandatory:   st.mandatory !== undefined ? st.mandatory : true,
            priority:    st.priority         || "medium",
            originalTaskId: stDoc._id,
          });
        }
      }

      if (taskDocs.length > 0) {
        await TaskMaster.insertMany(taskDocs, { session: dbSession });
        await SyllabusVersion.findByIdAndUpdate(
          svId,
          { taskMasterGenerated: true, taskMasterGeneratedAt: new Date() },
          { session: dbSession }
        );
      }

      createdVersions.push(svId);
    }

    await dbSession.commitTransaction();

    const populated = await SyllabusVersion.find({ _id: { $in: createdVersions } })
      .populate("sessionId", "name")
      .populate("levelId", "name order")
      .populate("subLevelId", "name order");

    res.status(201).json({
      success: true,
      message: `${createdVersions.length} syllabus version(s) created successfully`,
      data: populated
    });
  } catch (error) {
    await dbSession.abortTransaction();
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "A syllabus version for this subject + session + subLevel + version already exists"
      });
    }
    res.status(400).json({ success: false, message: error.message });
  } finally {
    dbSession.endSession();
  }
};

// ==================== GET ALL (with filters) ====================
exports.getAllSyllabusVersions = async (req, res) => {
  try {
    const { sessionId, levelId, subLevelId, status, subjectName } = req.query;
    const filter = { isActive: true };
    if (sessionId)    filter.sessionId    = sessionId;
    if (levelId)      filter.levelId      = levelId;
    if (subLevelId)   filter.subLevelId   = subLevelId;
    if (status)       filter.status       = status;
    if (subjectName)  filter.subjectName  = subjectName;

    const versions = await SyllabusVersion.find(filter)
      .populate("sessionId", "name")
      .populate("levelId", "name order")
      .populate("subLevelId", "name order")
      .sort({ subjectName: 1, createdAt: -1 });

    res.status(200).json({ success: true, count: versions.length, data: versions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== GET BY SUBLEVEL (grouped by subject) ====================
// GET /api/syllabus-versions/sublevel/:subLevelId?sessionId=
exports.getSyllabusVersionsBySubLevel = async (req, res) => {
  try {
    const { subLevelId } = req.params;
    const { sessionId }  = req.query;

    const filter = { subLevelId, isActive: true };
    if (sessionId) filter.sessionId = sessionId;

    const versions = await SyllabusVersion.find(filter)
      .populate("sessionId", "name")
      .populate("levelId", "name order")
      .populate("subLevelId", "name order")
      .sort({ subjectName: 1, createdAt: -1 });

    // Group by subjectName
    const grouped = {};
    versions.forEach((v) => {
      if (!grouped[v.subjectName]) grouped[v.subjectName] = [];
      grouped[v.subjectName].push(v);
    });

    res.status(200).json({
      success: true,
      count: versions.length,
      data: versions,          // flat list for backward compat
      grouped                  // grouped by subject for frontend
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== GET BY SESSION ====================
exports.getSyllabusVersionsBySession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { levelId, subLevelId } = req.query;
    const filter = { sessionId, isActive: true };
    if (levelId)    filter.levelId    = levelId;
    if (subLevelId) filter.subLevelId = subLevelId;

    const versions = await SyllabusVersion.find(filter)
      .populate("sessionId", "name")
      .populate("levelId", "name order")
      .populate("subLevelId", "name order")
      .sort({ subjectName: 1, createdAt: -1 });

    res.status(200).json({ success: true, count: versions.length, data: versions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== GET BY ID ====================
exports.getSyllabusVersionById = async (req, res) => {
  try {
    const version = await SyllabusVersion.findById(req.params.id)
      .populate("sessionId", "name")
      .populate("levelId", "name order")
      .populate("subLevelId", "name order");
    if (!version) return res.status(404).json({ success: false, message: "Not found" });
    res.status(200).json({ success: true, data: version });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== GET WITH HIERARCHY ====================
exports.getSyllabusVersionWithHierarchy = async (req, res) => {
  try {
    const { id } = req.params;
    const version = await SyllabusVersion.findById(id)
      .populate("sessionId", "name")
      .populate("levelId", "name order")
      .populate("subLevelId", "name order");
    if (!version) return res.status(404).json({ success: false, message: "Not found" });

    const [subjects, topics, subTopics] = await Promise.all([
      Subject.find({ syllabusVersionId: id, isActive: true }).lean(),
      Topic.find({ syllabusVersionId: id, isActive: true }).sort({ order: 1 }).lean(),
      SubTopic.find({ syllabusVersionId: id, isActive: true }).sort({ order: 1 }).lean()
    ]);

    const hierarchy = subjects.map((subject) => ({
      ...subject,
      topics: topics
        .filter((t) => t.subjectId.toString() === subject._id.toString())
        .map((topic) => ({
          ...topic,
          subTopics: subTopics.filter((st) => st.topicId.toString() === topic._id.toString())
        }))
    }));

    res.status(200).json({ success: true, data: { ...version.toObject(), subjects: hierarchy } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== UPDATE ====================
exports.updateSyllabusVersion = async (req, res) => {
  try {
    const version = await SyllabusVersion.findById(req.params.id);
    if (!version) return res.status(404).json({ success: false, message: "Not found" });
    if (version.status !== "draft") {
      return res.status(400).json({ success: false, message: "Only draft versions can be updated" });
    }
    ["version", "status", "isActive"].forEach((f) => {
      if (req.body[f] !== undefined) version[f] = req.body[f];
    });
    await version.save();
    res.status(200).json({ success: true, message: "Updated", data: version });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// ==================== APPROVE ====================
exports.approveSyllabusVersion = async (req, res) => {
  try {
    const version = await SyllabusVersion.findById(req.params.id);
    if (!version) return res.status(404).json({ success: false, message: "Not found" });
    if (version.status !== "draft") {
      return res.status(400).json({ success: false, message: "Only draft versions can be approved" });
    }
    version.status = "approved";
    await version.save();
    res.status(200).json({ success: true, message: "Approved", data: version });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== ACTIVATE ====================
// Only archives other versions of the SAME subject — other subjects unaffected
exports.activateSyllabusVersion = async (req, res) => {
  try {
    const version = await SyllabusVersion.findById(req.params.id);
    if (!version) return res.status(404).json({ success: false, message: "Not found" });
    if (version.status !== "approved") {
      return res.status(400).json({ success: false, message: "Only approved versions can be activated" });
    }

    // Archive other active versions of the SAME subject in same subLevel + session
    await SyllabusVersion.updateMany(
      {
        sessionId:   version.sessionId,
        subLevelId:  version.subLevelId,
        subjectName: version.subjectName,   // <-- only same subject
        status:      "active",
        _id:         { $ne: version._id }
      },
      { status: "archived" }
    );

    version.status = "active";
    await version.save();
    res.status(200).json({ success: true, message: "Activated", data: version });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== ARCHIVE ====================
exports.archiveSyllabusVersion = async (req, res) => {
  try {
    const version = await SyllabusVersion.findById(req.params.id);
    if (!version) return res.status(404).json({ success: false, message: "Not found" });
    if (version.status === "archived") {
      return res.status(400).json({ success: false, message: "Already archived" });
    }
    version.status = "archived";
    await version.save();
    res.status(200).json({ success: true, message: "Archived", data: version });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== DELETE (soft) ====================
exports.deleteSyllabusVersion = async (req, res) => {
  try {
    const version = await SyllabusVersion.findById(req.params.id);
    if (!version) return res.status(404).json({ success: false, message: "Not found" });
    if (version.status === "active") {
      return res.status(400).json({ success: false, message: "Cannot delete active version. Archive it first." });
    }
    version.isActive = false;
    await version.save();
    res.status(200).json({ success: true, message: "Deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
