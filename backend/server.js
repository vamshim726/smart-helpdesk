const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const cors = require('cors');
const cookieParser = require('cookie-parser');

// Load environment variables
dotenv.config();

const { connectToDatabase } = require('./utils/db');

const app = express();

// Middlewares
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());
app.use(morgan('dev'));

// Routes
const authRoutes = require('./routes/auth.routes');
const adminRoutes = require('./routes/admin.routes');

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/health', (req, res) => {
	return res.status(200).json({ 
		status: 'ok',
		timestamp: new Date().toISOString(),
		environment: process.env.NODE_ENV || 'development'
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
		app.listen(PORT, () => {
			console.log(`🚀 Server listening on port ${PORT}`);
			console.log(`📊 Health check: http://localhost:${PORT}/health`);
			console.log(`🔐 Auth API: http://localhost:${PORT}/api/auth`);
			console.log(`👑 Admin API: http://localhost:${PORT}/api/admin`);
		});
	})
	.catch((error) => {
		console.error('❌ Failed to start server:', error);
		process.exit(1);
	});

module.exports = app;
