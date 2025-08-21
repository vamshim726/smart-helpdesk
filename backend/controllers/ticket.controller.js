const Ticket = require('../models/Ticket');
const KBArticle = require('../models/KBArticle');
const Config = require('../models/Config');
const AuditLog = require('../models/AuditLog');
const { notifyTicketUpdate } = require('../services/notify');

// Lightweight classification and KB helpers used during auto-triage on creation
const TRIAGE_RULES = [
	{ category: 'billing', keywords: ['invoice', 'billing', 'refund', 'charge', 'payment'] },
	{ category: 'tech', keywords: ['error', 'bug', 'crash', 'issue', 'install', 'connect', 'login'] },
	{ category: 'shipping', keywords: ['shipping', 'delivery', 'tracking', 'package'] },
	{ category: 'account', keywords: ['password', 'reset', 'forgot password', 'account', 'unlock', '2fa', 'two-factor'] },
];

const classify = (text) => {
	const lower = `${text || ''}`.toLowerCase();
	let best = { category: 'other', score: 0 };
	for (const rule of TRIAGE_RULES) {
		let score = 0;
		for (const kw of rule.keywords) {
			if (lower.includes(kw)) score += 1;
		}
		if (score > best.score) best = { category: rule.category, score };
	}
	const confidence = Math.min(1, best.score / 2);
	return { category: best.category, confidence };
};

const searchKB = async (q, limit = 3) => {
	if (!q) return [];
	return KBArticle.find({ $text: { $search: q }, status: 'published' })
		.select('title status updatedAt')
		.sort({ score: { $meta: 'textScore' } })
		.limit(limit);
};

const draftReply = (ticket, articles) => {
	const lines = [];
	lines.push(`Hello ${ticket.createdBy?.name || ''},`);
	lines.push('');
	lines.push('Thanks for reaching out. Based on your message, here are some helpful articles:');
	for (const a of articles) {
		lines.push(`- ${a.title}`);
	}
	lines.push('');
	lines.push('If this resolves your issue, we will close the ticket. Otherwise, reply and a human agent will assist you.');
	lines.push('');
	lines.push('Best regards,');
	lines.push('Smart Helpdesk');
	return lines.join('\n');
};

// POST /api/tickets - create ticket (logged-in users)
const createTicket = async (req, res) => {
	try {
		const { title, description, category = 'other' } = req.body;
		if (!title || !description) {
			return res.status(400).json({ message: 'Title and description are required', error: 'MISSING_FIELDS' });
		}
		let ticket = await Ticket.create({
			title: String(title).trim(),
			description,
			category,
			createdBy: req.user.sub,
		});

		// Auto-triage workflow
		try {
			const config = await Config.findOne();
			const autoCloseEnabled = !!config?.autoCloseEnabled;
			// Lower threshold for testing fallback
			const threshold = Number(config?.confidenceThreshold ?? 0.5);

			// Reload with createdBy populated for proper greeting
			ticket = await Ticket.findById(ticket._id).populate('createdBy', 'name email');
			const classification = classify(`${ticket.title}\n${ticket.description}`);
			const kbArticles = await searchKB(`${ticket.title} ${ticket.description}`.slice(0, 200), 3);
			const reply = draftReply(ticket, kbArticles);

			await AuditLog.create({ traceId: `create-${ticket._id}-${Date.now()}`, ticket: ticket._id, step: 'triage_on_create', message: 'Ran triage on creation', metadata: { classification } });

			let update = { category: classification.category, agentSuggestion: kbArticles[0]?._id };
			if (autoCloseEnabled && classification.confidence >= threshold) {
				update.status = 'resolved';
				// Store system draft reply for transparency
				update.$push = { replies: { author: req.user.sub, body: reply, from: 'system', kbRefs: kbArticles.map(a => a._id) } };
			}
			// Apply update if any
			if (Object.keys(update).length) {
				const apply = { new: true };
				const updated = await Ticket.findByIdAndUpdate(ticket._id, update, apply)
					.populate('createdBy', 'name email role')
					.populate('assignee', 'name email role')
					.populate('agentSuggestion', 'title status');
				if (updated) ticket = updated;
			}

			await notifyTicketUpdate({ ticket, title: 'Ticket created', message: 'Your ticket has been created.' });
		} catch (triageError) {
			// Non-fatal; ticket already created
			console.error('Auto-triage on create failed:', triageError);
		}

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
		const { status, mine, assigned, page = 1, limit = 20 } = req.query;
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

		const isStaff = ['admin', 'agent'].includes(req.user.role);
		if (!isStaff) {
			// Non-staff can only see their own tickets regardless of query
			filter.createdBy = req.user.sub;
		} else {
			if (mine === 'true') filter.createdBy = req.user.sub; // staff authored
			if (assigned === 'true') filter.assignee = req.user.sub; // staff assigned
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
			.populate('agentSuggestion', 'title status')
			.populate('replies.author', 'name email role')
			.populate('replies.kbRefs', 'title status');
		if (!ticket) return res.status(404).json({ message: 'Ticket not found', error: 'NOT_FOUND' });

		const isStaff = ['admin', 'agent'].includes(req.user.role);
		if (!isStaff && String(ticket.createdBy._id || ticket.createdBy) !== String(req.user.sub)) {
			return res.status(403).json({ message: 'Forbidden', error: 'FORBIDDEN' });
		}
		return res.status(200).json({ ticket });
	} catch (error) {
		console.error('Get ticket error:', error);
		return res.status(500).json({ message: 'Internal server error', error: 'INTERNAL_ERROR' });
	}
};

// POST /api/tickets/:id/replies - add a reply (user or staff)
const addReply = async (req, res) => {
	try {
		const { id } = req.params;
		const { body, kbRefs = [], status } = req.body || {};
		if (!body) return res.status(400).json({ message: 'Reply body is required', error: 'MISSING_FIELDS' });

		let ticket = await Ticket.findById(id);
		if (!ticket) return res.status(404).json({ message: 'Ticket not found', error: 'NOT_FOUND' });

		const isStaff = ['admin', 'agent'].includes(req.user.role);
		// Permission: users can reply only to their own tickets
		if (!isStaff && String(ticket.createdBy) !== String(req.user.sub)) {
			return res.status(403).json({ message: 'Forbidden', error: 'FORBIDDEN' });
		}

		const from = isStaff ? 'agent' : 'user';
		const replyDoc = { author: req.user.sub, body: String(body), from, kbRefs: Array.isArray(kbRefs) ? kbRefs : [] };
		// Determine status transition
		let newStatus = ticket.status;
		if (!isStaff) {
			// Customer replying moves to waiting_human if previously resolved/closed
			if (['resolved', 'closed'].includes(ticket.status)) newStatus = 'waiting_human';
		} else if (status && ['open', 'triaged', 'waiting_human', 'resolved', 'closed'].includes(status)) {
			newStatus = status;
		}

		ticket = await Ticket.findByIdAndUpdate(
			id,
			{ $push: { replies: replyDoc }, status: newStatus },
			{ new: true }
		)
			.populate('createdBy', 'name email role')
			.populate('assignee', 'name email role')
			.populate('agentSuggestion', 'title status')
			.populate('replies.author', 'name email role')
			.populate('replies.kbRefs', 'title status');

		await notifyTicketUpdate({ ticket, title: 'New ticket reply', message: 'A new reply was posted on the ticket.' });
		return res.status(200).json({ ticket });
	} catch (error) {
		console.error('Add reply error:', error);
		return res.status(500).json({ message: 'Internal server error', error: 'INTERNAL_ERROR' });
	}
};

module.exports = { createTicket, listTickets, getTicket, addReply };
