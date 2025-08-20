let transporter = null;

const initMailer = () => {
	try {
		const nodemailer = require('nodemailer');
		if (process.env.SMTP_HOST) {
			transporter = nodemailer.createTransport({
				host: process.env.SMTP_HOST,
				port: Number(process.env.SMTP_PORT || 587),
				secure: false,
				auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
			});
		}
	} catch (e) {
		// nodemailer not installed or other issue; will fallback to console
	}
};

const sendMail = async ({ to, subject, text }) => {
	if (!transporter) {
		console.log('[MAIL:stub]', { to, subject, text });
		return;
	}
	await transporter.sendMail({ from: process.env.MAIL_FROM || 'no-reply@smart-helpdesk', to, subject, text });
};

module.exports = { initMailer, sendMail };
