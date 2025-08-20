const express = require('express');
const router = express.Router();
const { register, login, getProfile } = require('../controllers/auth.controller');
const { auth, requireUserOrAdmin } = require('../middlewares/auth.middleware');

// Public routes (no authentication required)
router.post('/register', register);
router.post('/login', login);

// Protected routes (authentication required)
router.get('/profile', auth, requireUserOrAdmin, getProfile);

module.exports = router;
