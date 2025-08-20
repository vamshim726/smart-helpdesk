const cron = require('node-cron');
const Ticket = require('../models/Ticket');
const Config = require('../models/Config');
const AuditLog = require('../models/AuditLog');
const { notifyTicketUpdate } = require('../services/notify');

const runOnce = async () => {
	const config = await Config.findOne();
	const hours = config?.slaHours || 72;
	const thresholdMs = hours * 60 * 60 * 1000;
	const since = new Date(Date.now() - thresholdMs);

	const candidates = await Ticket.find({
		status: { $in: ['open', 'triaged', 'waiting_human'] },
		updatedAt: { $lt: since },
		slaBreached: { $ne: true },
	});

	for (const t of candidates) {
		await Ticket.updateOne({ _id: t._id }, { slaBreached: true, slaBreachedAt: new Date() });
		await AuditLog.create({ traceId: `sla-${t._id}-${Date.now()}`, ticket: t._id, step: 'sla_breach', message: `SLA breached after ${hours}h`, metadata: { hours } });
		await notifyTicketUpdate({ ticket: t, title: 'SLA breached', message: `Ticket exceeded SLA (${hours}h)` });
	}

	return { checked: candidates.length };
};

const scheduleNightly = () => {
	// Run every day at 02:00 server time
	cron.schedule('0 2 * * *', async () => {
		try {
			await runOnce();
			// eslint-disable-next-line no-empty
		} catch (e) {}
	});
};

module.exports = { scheduleNightly, runOnce };
