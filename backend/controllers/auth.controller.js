const User = require('../models/User');
const { signToken } = require('../utils/jwt');

const register = async (req, res) => {
	try {
		const { name, email, password, role } = req.body;
		
		// Enhanced validation
		if (!name || !email || !password) {
			return res.status(400).json({ 
				message: 'Name, email and password are required',
				error: 'MISSING_FIELDS',
				required: ['name', 'email', 'password']
			});
		}

		// Password strength validation
		if (password.length < 6) {
			return res.status(400).json({ 
				message: 'Password must be at least 6 characters long',
				error: 'WEAK_PASSWORD'
			});
		}

		// Check if user already exists
		const existingUser = await User.findByEmail(email);
		if (existingUser) {
			return res.status(409).json({ 
				message: 'Email already in use',
				error: 'EMAIL_EXISTS'
			});
		}

		// Hash password and create user
		const passwordHash = await User.hashPassword(password);
		const userData = { name, email, passwordHash };
		
		// Only allow valid roles if explicitly provided
		if (role && ['admin', 'agent', 'user'].includes(role)) {
			userData.role = role;
		}

		const user = await User.create(userData);
		
		// Generate JWT token
		const token = signToken({ 
			sub: user._id, 
			role: user.role, 
			email: user.email 
		});

		// Return user data (passwordHash will be automatically excluded)
		return res.status(201).json({
			message: 'User registered successfully',
			user: {
				id: user._id,
				name: user.name,
				email: user.email,
				role: user.role,
				createdAt: user.createdAt
			},
			token
		});
	} catch (error) {
		console.error('Register error:', error);
		
		// Handle Mongoose validation errors
		if (error.name === 'ValidationError') {
			const validationErrors = Object.values(error.errors).map(err => err.message);
			return res.status(400).json({ 
				message: 'Validation failed',
				error: 'VALIDATION_ERROR',
				details: validationErrors
			});
		}

		// Handle duplicate key errors
		if (error.code === 11000) {
			return res.status(409).json({ 
				message: 'Email already exists',
				error: 'DUPLICATE_EMAIL'
			});
		}

		return res.status(500).json({ 
			message: 'Internal server error',
			error: 'INTERNAL_ERROR'
		});
	}
};

const login = async (req, res) => {
	try {
		const { email, password } = req.body;
		
		// Enhanced validation
		if (!email || !password) {
			return res.status(400).json({ 
				message: 'Email and password are required',
				error: 'MISSING_CREDENTIALS',
				required: ['email', 'password']
			});
		}

		// Find user by email (case-insensitive)
		const user = await User.findByEmail(email);
		if (!user) {
			return res.status(401).json({ 
				message: 'Invalid credentials',
				error: 'INVALID_CREDENTIALS'
			});
		}

		// Check if user is active
		if (!user.isActive) {
			return res.status(401).json({ 
				message: 'Account is deactivated',
				error: 'ACCOUNT_DEACTIVATED'
			});
		}

		// Verify password
		const isMatch = await user.comparePassword(password);
		if (!isMatch) {
			return res.status(401).json({ 
				message: 'Invalid credentials',
				error: 'INVALID_CREDENTIALS'
			});
		}

		// Update last login
		await user.updateLastLogin();

		// Generate JWT token
		const token = signToken({ 
			sub: user._id, 
			role: user.role, 
			email: user.email 
		});

		return res.status(200).json({
			message: 'Login successful',
			user: {
				id: user._id,
				name: user.name,
				email: user.email,
				role: user.role,
				lastLogin: user.lastLogin
			},
			token
		});
	} catch (error) {
		console.error('Login error:', error);
		return res.status(500).json({ 
			message: 'Internal server error',
			error: 'INTERNAL_ERROR'
		});
	}
};

// Get current user profile
const getProfile = async (req, res) => {
	try {
		const userId = req.user.sub;
		const user = await User.findById(userId).select('-passwordHash');
		
		if (!user) {
			return res.status(404).json({ 
				message: 'User not found',
				error: 'USER_NOT_FOUND'
			});
		}

		return res.status(200).json({
			user
		});
	} catch (error) {
		console.error('Get profile error:', error);
		return res.status(500).json({ 
			message: 'Internal server error',
			error: 'INTERNAL_ERROR'
		});
	}
};

module.exports = { register, login, getProfile };
