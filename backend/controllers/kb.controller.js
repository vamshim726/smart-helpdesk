const KBArticle = require('../models/KBArticle');

// GET /api/kb
// Public: list and search articles (optionally filter by status/tags/text)
const listKBArticles = async (req, res) => {
	try {
		const { q, status, tags, page = 1, limit = 20 } = req.query;
		const numericLimit = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
		const numericPage = Math.max(parseInt(page, 10) || 1, 1);

		const filter = {};
		if (status && ['draft', 'published'].includes(status)) {
			filter.status = status;
		} else {
			// Default: only published for unauthenticated users
			filter.status = 'published';
		}

		if (tags) {
			const tagArray = Array.isArray(tags) ? tags : String(tags).split(',');
			filter.tags = { $in: tagArray.map((t) => t.trim()).filter(Boolean) };
		}

		let query = KBArticle.find(filter);
		if (q) {
			query = query.find({ $text: { $search: q } });
		}

		const [items, total] = await Promise.all([
			query
				.sort({ updatedAt: -1 })
				.skip((numericPage - 1) * numericLimit)
				.limit(numericLimit),
			KBArticle.countDocuments(q ? { ...filter, $text: { $search: q } } : filter),
		]);

		return res.status(200).json({
			items,
			page: numericPage,
			limit: numericLimit,
			total,
			pages: Math.ceil(total / numericLimit),
		});
	} catch (error) {
		console.error('List KB error:', error);
		return res.status(500).json({ message: 'Internal server error', error: 'INTERNAL_ERROR' });
	}
};

// GET /api/kb/:id
// Public: get single published article (or any status if admin/agent later if desired)
const getKBArticle = async (req, res) => {
	try {
		const { id } = req.params;
		const article = await KBArticle.findById(id);
		if (!article) return res.status(404).json({ message: 'Article not found', error: 'NOT_FOUND' });
		if (article.status !== 'published') {
			return res.status(403).json({ message: 'Article not published', error: 'NOT_PUBLISHED' });
		}
		return res.status(200).json({ article });
	} catch (error) {
		console.error('Get KB error:', error);
		return res.status(500).json({ message: 'Internal server error', error: 'INTERNAL_ERROR' });
	}
};

// POST /api/kb (admin only)
const createKBArticle = async (req, res) => {
	try {
		const { title, body, tags = [], status = 'draft' } = req.body;
		if (!title || !body) {
			return res.status(400).json({ message: 'Title and body are required', error: 'MISSING_FIELDS' });
		}
		const article = await KBArticle.create({ title, body, tags, status });
		return res.status(201).json({ message: 'Article created', article });
	} catch (error) {
		console.error('Create KB error:', error);
		if (error.name === 'ValidationError') {
			const details = Object.values(error.errors).map((e) => e.message);
			return res.status(400).json({ message: 'Validation failed', error: 'VALIDATION_ERROR', details });
		}
		return res.status(500).json({ message: 'Internal server error', error: 'INTERNAL_ERROR' });
	}
};

// PUT /api/kb/:id (admin only)
const updateKBArticle = async (req, res) => {
	try {
		const { id } = req.params;
		const { title, body, tags, status } = req.body;
		const update = {};
		if (title !== undefined) update.title = title;
		if (body !== undefined) update.body = body;
		if (tags !== undefined) update.tags = tags;
		if (status !== undefined) update.status = status;
		update.updatedAt = new Date();

		const article = await KBArticle.findByIdAndUpdate(id, update, { new: true, runValidators: true });
		if (!article) return res.status(404).json({ message: 'Article not found', error: 'NOT_FOUND' });
		return res.status(200).json({ message: 'Article updated', article });
	} catch (error) {
		console.error('Update KB error:', error);
		if (error.name === 'ValidationError') {
			const details = Object.values(error.errors).map((e) => e.message);
			return res.status(400).json({ message: 'Validation failed', error: 'VALIDATION_ERROR', details });
		}
		return res.status(500).json({ message: 'Internal server error', error: 'INTERNAL_ERROR' });
	}
};

// DELETE /api/kb/:id (admin only)
const deleteKBArticle = async (req, res) => {
	try {
		const { id } = req.params;
		const article = await KBArticle.findByIdAndDelete(id);
		if (!article) return res.status(404).json({ message: 'Article not found', error: 'NOT_FOUND' });
		return res.status(200).json({ message: 'Article deleted' });
	} catch (error) {
		console.error('Delete KB error:', error);
		return res.status(500).json({ message: 'Internal server error', error: 'INTERNAL_ERROR' });
	}
};

module.exports = {
	listKBArticles,
	getKBArticle,
	createKBArticle,
	updateKBArticle,
	deleteKBArticle,
};
