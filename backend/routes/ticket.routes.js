const express = require('express');
const router = express.Router();
const { auth, requireCustomer } = require('../middlewares/auth.middleware');
const { createTicket, listTickets, getTicket, addReply } = require('../controllers/ticket.controller');

// All ticket routes require authentication
router.use(auth);

// Only regular users can create tickets
router.post('/', requireCustomer, createTicket);
router.get('/', listTickets);
router.get('/:id', getTicket);
router.post('/:id/replies', addReply);

module.exports = router;
