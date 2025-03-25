const express = require('express');
const { createSuperAdmin } = require('../modules/SuperAdmin/controllers/superAdminController');
const router = express.Router();


router.post('/', createSuperAdmin);

module.exports = router;
