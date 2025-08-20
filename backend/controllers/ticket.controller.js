const Ticket = require('../models/Ticket');

// POST /api/tickets - create ticket (logged-in users)
const createTicket = async (req, res) => {
	try {
		const { title, description, category = 'other' } = req.body;
		if (!title || !description) {
			return res.status(400).json({ message: 'Title and description are required', error: 'MISSING_FIELDS' });
		}
		const ticket = await Ticket.create({
			title: String(title).trim(),
			description,
			category,
			createdBy: req.user.sub,
		});
		return res.status(201).json({ message: 'Ticket created', ticket });
	} catch (error) {
		console.error('Create ticket error:', error);
		if (error.name === 'ValidationError') {
			const details = Object.values(error.errors).map((e) => e.message);
			return res.status(400).json({ message: 'Validation failed', error: 'VALIDATION_ERROR', details });
		}
		return res.status(500).json({ message: 'Internal server error', error: 'INTERNAL_ERROR' });
	}
};

// GET /api/tickets - list with optional filters
// Filters: status, mine=true (owned by current user)
const listTickets = async (req, res) => {
	try {
		const { status, mine, page = 1, limit = 20 } = req.query;
		const numericLimit = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
		const numericPage = Math.max(parseInt(page, 10) || 1, 1);

		const filter = {};
		if (status) {
			const allowed = ['open', 'triaged', 'waiting_human', 'resolved', 'closed'];
			if (!allowed.includes(status)) {
				return res.status(400).json({ message: 'Invalid status filter', error: 'INVALID_STATUS' });
			}
			filter.status = status;
		}
		if (mine === 'true') {
			filter.createdBy = req.user.sub;
		}

		const [items, total] = await Promise.all([
			Ticket.find(filter)
				.populate('createdBy', 'name email role')
				.populate('assignee', 'name email role')
				.populate('agentSuggestion', 'title status')
				.sort({ createdAt: -1 })
				.skip((numericPage - 1) * numericLimit)
				.limit(numericLimit),
			Ticket.countDocuments(filter),
		]);

		return res.status(200).json({ items, page: numericPage, limit: numericLimit, total, pages: Math.ceil(total / numericLimit) });
	} catch (error) {
		console.error('List tickets error:', error);
		return res.status(500).json({ message: 'Internal server error', error: 'INTERNAL_ERROR' });
	}
};

// GET /api/tickets/:id - detail (must be logged-in)
const getTicket = async (req, res) => {
	try {
		const { id } = req.params;
		const ticket = await Ticket.findById(id)
			.populate('createdBy', 'name email role')
			.populate('assignee', 'name email role')
			.populate('agentSuggestion', 'title status');
		if (!ticket) return res.status(404).json({ message: 'Ticket not found', error: 'NOT_FOUND' });
		return res.status(200).json({ ticket });
	} catch (error) {
		console.error('Get ticket error:', error);
		return res.status(500).json({ message: 'Internal server error', error: 'INTERNAL_ERROR' });
	}
};

module.exports = { createTicket, listTickets, getTicket };
