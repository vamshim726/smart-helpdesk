const mongoose = require('mongoose');

const kbArticleSchema = new mongoose.Schema(
	{
		title: {
			type: String,
			required: [true, 'Title is required'],
			trim: true,
			maxlength: [200, 'Title cannot exceed 200 characters'],
		},
		body: {
			type: String,
			required: [true, 'Body is required'],
		},
		tags: {
			type: [String],
			default: [],
			set: (values) => Array.isArray(values) ? values.map((t) => String(t).trim()).filter(Boolean) : [],
		},
		status: {
			type: String,
			enum: {
				values: ['draft', 'published'],
				message: 'Status must be either "draft" or "published"',
			},
			default: 'draft',
		},
	},
	{
		timestamps: true,
	}
);

// Full-text index for search across title and body
kbArticleSchema.index({ title: 'text', body: 'text' }, { name: 'kb_text_search' });

// Secondary indexes to speed up common queries
kbArticleSchema.index({ updatedAt: -1 });
kbArticleSchema.index({ status: 1 });
kbArticleSchema.index({ tags: 1 });

const KBArticle = mongoose.model('KBArticle', kbArticleSchema);
module.exports = KBArticle;
