const User = require('../models/User');
const { signToken } = require('../utils/jwt');

const register = async (req, res) => {
	try {
		const { name, email, password, role } = req.body;
		if (!name || !email || !password) {
			return res.status(400).json({ message: 'name, email and password are required' });
		}

		const existing = await User.findOne({ email });
		if (existing) {
			return res.status(409).json({ message: 'Email already in use' });
		}

		const passwordHash = await User.hashPassword(password);
		const user = await User.create({ name, email, passwordHash, role });
		const token = signToken({ sub: user._id, role: user.role, email: user.email });

		return res.status(201).json({
			user: { id: user._id, name: user.name, email: user.email, role: user.role },
			token,
		});
	} catch (error) {
		console.error('Register error:', error);
		return res.status(500).json({ message: 'Internal server error' });
	}
};

const login = async (req, res) => {
	try {
		const { email, password } = req.body;
		if (!email || !password) {
			return res.status(400).json({ message: 'email and password are required' });
		}

		const user = await User.findOne({ email });
		if (!user) {
			return res.status(401).json({ message: 'Invalid credentials' });
		}

		const isMatch = await user.comparePassword(password);
		if (!isMatch) {
			return res.status(401).json({ message: 'Invalid credentials' });
		}

		const token = signToken({ sub: user._id, role: user.role, email: user.email });
		return res.status(200).json({
			user: { id: user._id, name: user.name, email: user.email, role: user.role },
			token,
		});
	} catch (error) {
		console.error('Login error:', error);
		return res.status(500).json({ message: 'Internal server error' });
	}
};

module.exports = { register, login };
