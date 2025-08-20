const Notification = require('../models/Notification');
const { emitToUser } = require('../utils/realtime');
const { sendMail } = require('../utils/mailer');
const User = require('../models/User');

const createNotification = async ({ userId, type, title, message, ticketId }) => {
	const notif = await Notification.create({ user: userId, type, title, message, ticket: ticketId });
	emitToUser(String(userId), 'notification', { id: notif._id, type, title, message, ticketId, createdAt: notif.createdAt });
	return notif;
};

const notifyTicketUpdate = async ({ ticket, title, message }) => {
	if (!ticket) return;
	const targetUserIds = new Set();
	if (ticket.createdBy) targetUserIds.add(String(ticket.createdBy));
	if (ticket.assignee) targetUserIds.add(String(ticket.assignee));
	for (const uid of targetUserIds) {
		await createNotification({ userId: uid, type: 'ticket_update', title, message, ticketId: ticket._id });
		try {
			const user = await User.findById(uid);
			if (user?.email) {
				await sendMail({ to: user.email, subject: title, text: message });
			}
		} catch {}
	}
};

module.exports = { createNotification, notifyTicketUpdate };
