const { verifyToken } = require('../utils/jwt');

const auth = (req, res, next) => {
	try {
		const header = req.headers.authorization || '';
		const token = header.startsWith('Bearer ') ? header.slice(7) : null;
		if (!token) {
			return res.status(401).json({ message: 'Authentication required' });
		}
		const payload = verifyToken(token);
		req.user = payload;
		return next();
	} catch (error) {
		return res.status(401).json({ message: 'Invalid or expired token' });
	}
};

module.exports = { auth };
