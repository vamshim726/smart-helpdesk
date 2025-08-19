const jwt = require('jsonwebtoken');

const signToken = (payload, options = {}) => {
	const secret = process.env.JWT_SECRET || 'change_me';
	const expiresIn = options.expiresIn || '7d';
	return jwt.sign(payload, secret, { expiresIn });
};

const verifyToken = (token) => {
	const secret = process.env.JWT_SECRET || 'change_me';
	return jwt.verify(token, secret);
};

module.exports = { signToken, verifyToken };
