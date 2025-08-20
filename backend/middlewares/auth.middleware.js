const { verifyToken } = require('../utils/jwt');

// JWT Authentication Middleware
const auth = (req, res, next) => {
	try {
		const header = req.headers.authorization || '';
		const token = header.startsWith('Bearer ') ? header.slice(7) : null;
		
		if (!token) {
			return res.status(401).json({ 
				message: 'Authentication required',
				error: 'NO_TOKEN'
			});
		}
		
		try {
			const payload = verifyToken(token);
			req.user = payload;
			return next();
		} catch (jwtError) {
			return res.status(401).json({ 
				message: 'Invalid or expired token',
				error: 'INVALID_TOKEN'
			});
		}
	} catch (error) {
		console.error('Auth middleware error:', error);
		return res.status(500).json({ 
			message: 'Internal server error',
			error: 'INTERNAL_ERROR'
		});
	}
};

// Role-based Access Control Middleware
const requireRole = (roles) => {
	return (req, res, next) => {
		if (!req.user) {
			return res.status(401).json({ 
				message: 'Authentication required',
				error: 'NO_USER'
			});
		}

		const userRole = req.user.role;
		const allowedRoles = Array.isArray(roles) ? roles : [roles];

		if (!allowedRoles.includes(userRole)) {
			return res.status(403).json({ 
				message: 'Insufficient permissions',
				error: 'INSUFFICIENT_PERMISSIONS',
				required: allowedRoles,
				current: userRole
			});
		}

		next();
	};
};

// Admin-only Access Middleware
const requireAdmin = requireRole('admin');

// User or Admin Access Middleware
const requireUserOrAdmin = requireRole(['user', 'admin']);

// Staff (Agent or Admin)
const requireStaff = requireRole(['agent', 'admin']);

module.exports = { 
	auth, 
	requireRole, 
	requireAdmin, 
	requireUserOrAdmin,
	requireStaff,
};
