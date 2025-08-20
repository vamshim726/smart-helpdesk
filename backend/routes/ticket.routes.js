const express = require('express');
const router = express.Router();
const { auth } = require('../middlewares/auth.middleware');
const { createTicket, listTickets, getTicket } = require('../controllers/ticket.controller');

// All ticket routes require authentication
router.use(auth);

router.post('/', createTicket);
router.get('/', listTickets);
router.get('/:id', getTicket);

module.exports = router;
