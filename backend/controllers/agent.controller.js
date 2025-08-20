const { v4: uuidv4 } = require('uuid');
const Ticket = require('../models/Ticket');
const KBArticle = require('../models/KBArticle');
const AuditLog = require('../models/AuditLog');

// simple keyword rules
const RULES = [
	{ category: 'billing', keywords: ['invoice', 'billing', 'refund', 'charge', 'payment'] },
	{ category: 'tech', keywords: ['error', 'bug', 'crash', 'issue', 'install', 'connect', 'login'] },
	{ category: 'shipping', keywords: ['shipping', 'delivery', 'tracking', 'package'] },
];

const classify = (text) => {
	const lower = `${text || ''}`.toLowerCase();
	let best = { category: 'other', score: 0 };
	for (const rule of RULES) {
		let score = 0;
		for (const kw of rule.keywords) {
			if (lower.includes(kw)) score += 1;
		}
		if (score > best.score) best = { category: rule.category, score };
	}
	const confidence = Math.min(1, best.score / 3);
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

const logStep = async (traceId, ticketId, step, message, metadata) => {
	await AuditLog.create({ traceId, ticket: ticketId, step, message, metadata });
};

// POST /api/agent/triage { ticketId, autoClose=true, confidenceThreshold=0.7 }
const triageTicket = async (req, res) => {
	const traceId = req.body.traceId || uuidv4();
	try {
		const { ticketId, autoClose = true, confidenceThreshold = 0.7 } = req.body;
		if (!ticketId) return res.status(400).json({ message: 'ticketId is required', error: 'MISSING_FIELDS' });

		let ticket = await Ticket.findById(ticketId).populate('createdBy', 'name email');
		if (!ticket) return res.status(404).json({ message: 'Ticket not found', error: 'NOT_FOUND' });

		await logStep(traceId, ticket._id, 'start', 'Starting triage', { autoClose, confidenceThreshold });

		// 1) classify
		const classification = classify(`${ticket.title}\n${ticket.description}`);
		await logStep(traceId, ticket._id, 'classify', 'Classified category', classification);

		// 2) kb search
		const kbQuery = `${ticket.title} ${ticket.description}`.slice(0, 200);
		const kbArticles = await searchKB(kbQuery, 3);
		await logStep(traceId, ticket._id, 'kb_search', 'Retrieved top KB articles', { count: kbArticles.length, ids: kbArticles.map(a => a._id) });

		// 3) draft reply
		const reply = draftReply(ticket, kbArticles);
		await logStep(traceId, ticket._id, 'draft_reply', 'Drafted reply', { length: reply.length });

		// 4) act based on confidence
		let action = 'assign_human';
		let updated;
		if (autoClose && classification.confidence >= confidenceThreshold) {
			updated = await Ticket.findByIdAndUpdate(
				ticket._id,
				{ status: 'resolved', category: classification.category, agentSuggestion: kbArticles[0]?._id },
				{ new: true }
			);
			action = 'auto_resolve';
			await logStep(traceId, ticket._id, 'auto_resolve', 'Auto resolved ticket', { category: classification.category });
		} else {
			updated = await Ticket.findByIdAndUpdate(
				ticket._id,
				{ status: ticket.status === 'open' ? 'triaged' : ticket.status, category: classification.category, agentSuggestion: kbArticles[0]?._id },
				{ new: true }
			);
			action = 'assign_human';
			await logStep(traceId, ticket._id, 'assign_human', 'Assigned to human agent', {});
		}

		return res.status(200).json({ traceId, action, classification, articles: kbArticles, reply, ticket: updated });
	} catch (error) {
		console.error('Triage error:', error);
		await logStep(traceId, req.body.ticketId, 'error', 'Triage failed', { message: error.message });
		return res.status(500).json({ message: 'Internal server error', error: 'INTERNAL_ERROR', traceId });
	}
};

module.exports = { triageTicket };
