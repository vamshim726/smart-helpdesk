const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
	{
		traceId: { type: String, required: true, index: true },
		ticket: { type: mongoose.Schema.Types.ObjectId, ref: 'Ticket', required: true, index: true },
		step: { type: String, required: true },
		message: { type: String, required: true },
		metadata: { type: mongoose.Schema.Types.Mixed, default: null },
	},
	{ timestamps: { createdAt: true, updatedAt: false } }
);

auditLogSchema.index({ createdAt: -1 });

const AuditLog = mongoose.model('AuditLog', auditLogSchema);
module.exports = AuditLog;
