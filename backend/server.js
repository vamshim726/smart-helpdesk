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
app.use(express.json());
app.use(cookieParser());
app.use(morgan('dev'));

// Routes
const authRoutes = require('./routes/auth.routes');
app.use('/api/auth', authRoutes);

// Health check
app.get('/health', (req, res) => {
	return res.status(200).json({ status: 'ok' });
});

// Start server
const PORT = process.env.PORT || 8080;

connectToDatabase()
	.then(() => {
		app.listen(PORT, () => {
			console.log(`Server listening on port ${PORT}`);
		});
	})
	.catch((error) => {
		console.error('Failed to start server:', error);
		process.exit(1);
	});

module.exports = app;
