const express = require('express');
const { createAdmin } = require('../modules/Admin/controllers/AdminController');
const router = express.Router();


router.post('/', createAdmin);

module.exports = router;