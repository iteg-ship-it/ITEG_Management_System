const SystemSettings = require('../models/SystemSettings');

exports.getSetting = async (req, res) => {
  try {
    const setting = await SystemSettings.findOne({ key: req.params.key });
    res.status(200).json({ success: true, value: setting?.value ?? null });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateSetting = async (req, res) => {
  try {
    const { value } = req.body;
    const setting = await SystemSettings.findOneAndUpdate(
      { key: req.params.key },
      { value, updatedBy: req.user?.id, updatedAt: new Date() },
      { new: true, upsert: true }
    );
    res.status(200).json({ success: true, value: setting.value });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAllSettings = async (req, res) => {
  try {
    const settings = await SystemSettings.find({});
    const result = {};
    settings.forEach(s => { result[s.key] = s.value; });
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
