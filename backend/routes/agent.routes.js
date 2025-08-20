const express = require('express');
const router = express.Router();
const { auth, requireStaff } = require('../middlewares/auth.middleware');
const { triageTicket, getSuggestion, postReply, assignTicket, reopenTicket, closeTicket, getAuditLogs } = require('../controllers/agent.controller');

router.post('/triage', auth, requireStaff, triageTicket);
router.get('/suggestion/:ticketId', auth, requireStaff, getSuggestion);
router.get('/logs/:ticketId', auth, requireStaff, getAuditLogs);

router.post('/tickets/:id/reply', auth, requireStaff, postReply);
router.post('/tickets/:id/assign', auth, requireStaff, assignTicket);
router.post('/tickets/:id/reopen', auth, requireStaff, reopenTicket);
router.post('/tickets/:id/close', auth, requireStaff, closeTicket);

module.exports = router;
