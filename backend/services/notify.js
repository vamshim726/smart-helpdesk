const Notification = require('../models/Notification');
const { emitToUser } = require('../utils/realtime');
const { sendMail } = require('../utils/mailer');
const User = require('../models/User');

// In-memory cache to prevent duplicate notifications (ticketId + title + message hash)
const processedNotifications = new Map();
const NOTIFICATION_TTL_MS = 30 * 1000;

const getNotificationKey = (ticketId, title, message) => {
  return `${ticketId}:${title}:${message}`;
};

const isNotificationProcessed = (key) => {
  const timestamp = processedNotifications.get(key);
  if (!timestamp) return false;
  if (Date.now() - timestamp > NOTIFICATION_TTL_MS) {
    processedNotifications.delete(key);
    return false;
  }
  return true;
};

const markNotificationProcessed = (key) => {
  processedNotifications.set(key, Date.now());
  // Cleanup old entries
  if (processedNotifications.size > 1000) {
    const now = Date.now();
    for (const [k, ts] of processedNotifications.entries()) {
      if (now - ts > NOTIFICATION_TTL_MS) processedNotifications.delete(k);
    }
  }
};

const createNotification = async ({ userId, type, title, message, ticketId }) => {
	const notif = await Notification.create({ user: userId, type, title, message, ticket: ticketId });
	emitToUser(String(userId), 'notification', { _id: notif._id, type, title, message, ticketId, createdAt: notif.createdAt });
	return notif;
};

const notifyTicketUpdate = async ({ ticket, title, message }) => {
	if (!ticket) return;
	
	// Create a unique key for this notification
	const notificationKey = getNotificationKey(ticket._id, title, message);
	
	// Check if we've already processed this notification recently
	if (isNotificationProcessed(notificationKey)) {
		console.log('Skipping duplicate notification:', notificationKey);
		return;
	}
	
	// Mark as processed before creating notifications
	markNotificationProcessed(notificationKey);
	
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
