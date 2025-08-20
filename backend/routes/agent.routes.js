const express = require('express');
const router = express.Router();
const { auth } = require('../middlewares/auth.middleware');
const { triageTicket } = require('../controllers/agent.controller');

router.post('/triage', auth, triageTicket);

module.exports = router;
