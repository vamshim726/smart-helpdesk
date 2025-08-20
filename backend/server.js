const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const cors = require('cors');
const cookieParser = require('cookie-parser');

// Load environment variables
dotenv.config();

const { connectToDatabase } = require('./utils/db');
const { initRealtime } = require('./utils/realtime');
const { initMailer } = require('./utils/mailer');
const { scheduleNightly } = require('./jobs/slaChecker');

const app = express();

// Middlewares
// CORS configuration
const corsOptions = {
	origin: ["http://localhost:5173", "http://localhost:3000", "http://localhost:4173"], 
	credentials: true,
	methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
	allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
	preflightContinue: false,
	optionsSuccessStatus: 204
};

app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());
app.use(morgan('dev'));

// Routes
const authRoutes = require('./routes/auth.routes');
const adminRoutes = require('./routes/admin.routes');
const kbRoutes = require('./routes/kb.routes');
const ticketRoutes = require('./routes/ticket.routes');
const agentRoutes = require('./routes/agent.routes');
const configRoutes = require('./routes/config.routes');
const notificationRoutes = require('./routes/notification.routes');

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/kb', kbRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/agent', agentRoutes);
app.use('/api/config', configRoutes);
app.use('/api/notifications', notificationRoutes);

// Health check
app.get('/health', (req, res) => {
	return res.status(200).json({ 
		status: 'ok',
		timestamp: new Date().toISOString(),
		environment: process.env.NODE_ENV || 'development'
	});
});

// Socket.IO health check
app.get('/socket-health', (req, res) => {
	return res.status(200).json({ 
		status: 'ok',
		socket: 'enabled',
		timestamp: new Date().toISOString()
	});
});

// 404 handler
app.use('*', (req, res) => {
	return res.status(404).json({ 
		message: 'Route not found',
		error: 'NOT_FOUND',
		path: req.originalUrl
	});
});

// Global error handler
app.use((error, req, res, next) => {
	console.error('Global error handler:', error);
	
	return res.status(500).json({ 
		message: 'Internal server error',
		error: 'INTERNAL_ERROR'
	});
});

// Start server
const PORT = process.env.PORT || 8080;

connectToDatabase()
	.then(() => {
		const server = app.listen(PORT, () => {
			console.log(`🚀 Server listening on port ${PORT}`);
			console.log(`📊 Health check: http://localhost:${PORT}/health`);
			console.log(`🔐 Auth API: http://localhost:${PORT}/api/auth`);
			console.log(`👑 Admin API: http://localhost:${PORT}/api/admin`);
			console.log(`📚 KB API: http://localhost:${PORT}/api/kb`);
			console.log(`🎫 Tickets API: http://localhost:${PORT}/api/tickets`);
			console.log(`🤖 Agent API: http://localhost:${PORT}/api/agent`);
			console.log(`⚙️ Config API: http://localhost:${PORT}/api/config`);
			console.log(`🔔 Notifications API: http://localhost:${PORT}/api/notifications`);
		});
		initRealtime(server);
		initMailer();
		scheduleNightly();
	})
	.catch((error) => {
		console.error('❌ Failed to start server:', error);
		process.exit(1);
	});

module.exports = app;
