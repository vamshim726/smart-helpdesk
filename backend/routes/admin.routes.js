const express = require('express');
const router = express.Router();
const { auth, requireAdmin } = require('../middlewares/auth.middleware');
const User = require('../models/User');
const { runOnce: runSlaOnce } = require('../jobs/slaChecker');

// All admin routes require authentication and admin role
router.use(auth);
router.use(requireAdmin);

// Get all users (admin only)
router.get('/users', async (req, res) => {
	try {
		const users = await User.find({}).select('-passwordHash').sort({ createdAt: -1 });
		
		return res.status(200).json({
			message: 'Users retrieved successfully',
			count: users.length,
			users
		});
	} catch (error) {
		console.error('Get users error:', error);
		return res.status(500).json({ 
			message: 'Internal server error',
			error: 'INTERNAL_ERROR'
		});
	}
});

// Get user by ID (admin only)
router.get('/users/:id', async (req, res) => {
	try {
		const user = await User.findById(req.params.id).select('-passwordHash');
		
		if (!user) {
			return res.status(404).json({ 
				message: 'User not found',
				error: 'USER_NOT_FOUND'
			});
		}

		return res.status(200).json({
			message: 'User retrieved successfully',
			user
		});
	} catch (error) {
		console.error('Get user error:', error);
		return res.status(500).json({ 
			message: 'Internal server error',
			error: 'INTERNAL_ERROR'
		});
	}
});

// Update user role (admin only)
router.patch('/users/:id/role', async (req, res) => {
	try {
		const { role } = req.body;
		
		if (!role || !['admin', 'agent', 'user'].includes(role)) {
			return res.status(400).json({ 
				message: 'Valid role (admin, agent, or user) is required',
				error: 'INVALID_ROLE'
			});
		}

		const user = await User.findByIdAndUpdate(
			req.params.id,
			{ role },
			{ new: true, runValidators: true }
		).select('-passwordHash');

		if (!user) {
			return res.status(404).json({ 
				message: 'User not found',
				error: 'USER_NOT_FOUND'
			});
		}

		return res.status(200).json({
			message: 'User role updated successfully',
			user
		});
	} catch (error) {
		console.error('Update user role error:', error);
		return res.status(500).json({ 
			message: 'Internal server error',
			error: 'INTERNAL_ERROR'
		});
	}
});

// Toggle user active status (admin only)
router.patch('/users/:id/status', async (req, res) => {
	try {
		const user = await User.findById(req.params.id);
		
		if (!user) {
			return res.status(404).json({ 
				message: 'User not found',
				error: 'USER_NOT_FOUND'
			});
		}

		user.isActive = !user.isActive;
		await user.save();

		return res.status(200).json({
			message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
			user: {
				id: user._id,
				name: user.name,
				email: user.email,
				role: user.role,
				isActive: user.isActive
			}
		});
	} catch (error) {
		console.error('Toggle user status error:', error);
		return res.status(500).json({ 
			message: 'Internal server error',
			error: 'INTERNAL_ERROR'
		});
	}
});

// Get system statistics (admin only)
router.get('/stats', async (req, res) => {
	try {
		const totalUsers = await User.countDocuments();
		const activeUsers = await User.countDocuments({ isActive: true });
		const adminUsers = await User.countDocuments({ role: 'admin' });
		const agentUsers = await User.countDocuments({ role: 'agent' });
		const userUsers = await User.countDocuments({ role: 'user' });

		return res.status(200).json({
			message: 'Statistics retrieved successfully',
			stats: {
				totalUsers,
				activeUsers,
				inactiveUsers: totalUsers - activeUsers,
				adminUsers,
				agentUsers,
				userUsers
			}
		});
	} catch (error) {
		console.error('Get stats error:', error);
		return res.status(500).json({ 
			message: 'Internal server error',
			error: 'INTERNAL_ERROR'
		});
	}
});

module.exports = router;

// SLA manual trigger (admin only)
router.post('/sla/run-once', async (req, res) => {
  try {
    const result = await runSlaOnce();
    return res.status(200).json({ message: 'SLA checker executed', result });
  } catch (error) {
    console.error('Run SLA once error:', error);
    return res.status(500).json({ message: 'Internal server error', error: 'INTERNAL_ERROR' });
  }
});
