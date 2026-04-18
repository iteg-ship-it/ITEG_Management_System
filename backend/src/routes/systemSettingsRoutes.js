const express = require('express');
const { getSetting, updateSetting, getAllSettings } = require('../controllers/systemSettingsController');
const { verifyToken } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/', verifyToken, getAllSettings);
router.get('/:key', getSetting); // public — needed on app load before auth
router.put('/:key', verifyToken, updateSetting);

module.exports = router;
