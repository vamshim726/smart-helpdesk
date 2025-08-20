const express = require('express');
const router = express.Router();
const { auth, requireAdmin } = require('../middlewares/auth.middleware');
const { getConfig, updateConfig } = require('../controllers/config.controller');

router.get('/', auth, requireAdmin, getConfig);
router.put('/', auth, requireAdmin, updateConfig);

module.exports = router;
