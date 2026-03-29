const SyllabusVersion = require('../../models/SyllabusVersion');
const Subject = require('../../models/syllabus/Subject');
const Topic = require('../../models/syllabus/Topic');
const SubTopic = require('../../models/syllabus/SubTopic');

// Create SyllabusVersion
exports.createSyllabusVersion = async (req, res) => {
  try {
    const { sessionId, levelId, subLevelId, version } = req.body;

    const syllabusVersion = await SyllabusVersion.create({
      sessionId,
      levelId,
      subLevelId,
      version
    });

    res.status(201).json({ success: true, data: syllabusVersion });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Get SyllabusVersion with Full Hierarchy (Subjects → Topics → SubTopics)
exports.getSyllabusVersionWithHierarchy = async (req, res) => {
  try {
    const { id } = req.params;

    const syllabusVersion = await SyllabusVersion.findById(id)
      .populate('sessionId', 'name')
      .populate('levelId', 'name order')
      .populate('subLevelId', 'name order');

    if (!syllabusVersion) {
      return res.status(404).json({ success: false, message: 'SyllabusVersion not found' });
    }

    // Get all subjects
    const subjects = await Subject.find({ 
      syllabusVersionId: id, 
      isActive: true 
    }).lean();

    // Get all topics
    const topics = await Topic.find({ 
      syllabusVersionId: id, 
      isActive: true 
    })
      .sort({ order: 1 })
      .lean();

    // Get all subtopics
    const subTopics = await SubTopic.find({ 
      syllabusVersionId: id, 
      isActive: true 
    })
      .sort({ order: 1 })
      .lean();

    // Build hierarchy
    const hierarchy = subjects.map(subject => {
      const subjectTopics = topics.filter(t => 
        t.subjectId.toString() === subject._id.toString()
      );

      const topicsWithSubTopics = subjectTopics.map(topic => {
        const topicSubTopics = subTopics.filter(st => 
          st.topicId.toString() === topic._id.toString()
        );

        return {
          ...topic,
          subTopics: topicSubTopics
        };
      });

      return {
        ...subject,
        topics: topicsWithSubTopics
      };
    });

    res.status(200).json({ 
      success: true, 
      data: {
        ...syllabusVersion.toObject(),
        subjects: hierarchy
      }
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Get All SyllabusVersions
exports.getAllSyllabusVersions = async (req, res) => {
  try {
    const syllabusVersions = await SyllabusVersion.find({ isActive: true })
      .populate('sessionId', 'name')
      .populate('levelId', 'name order')
      .populate('subLevelId', 'name order')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: syllabusVersions });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Get SyllabusVersion by ID (Simple)
exports.getSyllabusVersionById = async (req, res) => {
  try {
    const syllabusVersion = await SyllabusVersion.findById(req.params.id)
      .populate('sessionId', 'name')
      .populate('levelId', 'name order')
      .populate('subLevelId', 'name order');

    if (!syllabusVersion) {
      return res.status(404).json({ success: false, message: 'SyllabusVersion not found' });
    }

    res.status(200).json({ success: true, data: syllabusVersion });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Update SyllabusVersion
exports.updateSyllabusVersion = async (req, res) => {
  try {
    const syllabusVersion = await SyllabusVersion.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate('sessionId', 'name')
      .populate('levelId', 'name order')
      .populate('subLevelId', 'name order');

    if (!syllabusVersion) {
      return res.status(404).json({ success: false, message: 'SyllabusVersion not found' });
    }

    res.status(200).json({ success: true, data: syllabusVersion });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Delete SyllabusVersion (Soft Delete)
exports.deleteSyllabusVersion = async (req, res) => {
  try {
    const syllabusVersion = await SyllabusVersion.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!syllabusVersion) {
      return res.status(404).json({ success: false, message: 'SyllabusVersion not found' });
    }

    res.status(200).json({ success: true, message: 'SyllabusVersion deleted successfully' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
