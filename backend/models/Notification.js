const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
	{
		user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
		type: { type: String, required: true },
		title: { type: String, required: true },
		message: { type: String, required: true },
		ticket: { type: mongoose.Schema.Types.ObjectId, ref: 'Ticket', default: null },
		isRead: { type: Boolean, default: false, index: true },
	},
	{ timestamps: { createdAt: true, updatedAt: true } }
);

notificationSchema.index({ createdAt: -1 });

const Notification = mongoose.model('Notification', notificationSchema);
module.exports = Notification;
