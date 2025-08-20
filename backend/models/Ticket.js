const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema(
	{
		title: { type: String, required: [true, 'Title is required'], trim: true, maxlength: 200 },
		description: { type: String, required: [true, 'Description is required'] },
		category: {
			type: String,
			enum: {
				values: ['billing', 'tech', 'shipping', 'other'],
				message: 'Category must be one of billing, tech, shipping, other',
			},
			default: 'other',
		},
		status: {
			type: String,
			enum: {
				values: ['open', 'triaged', 'waiting_human', 'resolved', 'closed'],
				message: 'Invalid status',
			},
			default: 'open',
		},
		createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
		assignee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
		agentSuggestion: { type: mongoose.Schema.Types.ObjectId, ref: 'KBArticle', default: null },
	},
	{ timestamps: true }
);

// Indexes to speed up queries
ticketSchema.index({ createdBy: 1, createdAt: -1 });
ticketSchema.index({ assignee: 1 });
ticketSchema.index({ status: 1 });

const Ticket = mongoose.model('Ticket', ticketSchema);
module.exports = Ticket;
