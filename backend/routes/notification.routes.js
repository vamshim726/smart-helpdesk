const express = require('express');
const router = express.Router();
const { auth } = require('../middlewares/auth.middleware');
const Notification = require('../models/Notification');

router.use(auth);

router.get('/', async (req, res) => {
	try {
		const notifs = await Notification.find({ user: req.user.sub }).sort({ createdAt: -1 }).limit(50);
		return res.status(200).json({ notifications: notifs });
	} catch (error) {
		console.error('Get notifications error:', error);
		return res.status(500).json({ message: 'Internal server error', error: 'INTERNAL_ERROR' });
	}
});

router.post('/:id/read', async (req, res) => {
	try {
		const { id } = req.params;
		
		// Validate ID parameter
		if (!id || id === 'undefined' || id === 'null') {
			return res.status(400).json({ 
				message: 'Invalid notification ID', 
				error: 'INVALID_ID',
				receivedId: id 
			});
		}
		
		// Validate ObjectId format
		if (!/^[0-9a-fA-F]{24}$/.test(id)) {
			return res.status(400).json({ 
				message: 'Invalid notification ID format', 
				error: 'INVALID_ID_FORMAT',
				receivedId: id 
			});
		}
		
		const updated = await Notification.findOneAndUpdate(
			{ _id: id, user: req.user.sub }, 
			{ isRead: true }, 
			{ new: true }
		);
		
		if (!updated) {
			return res.status(404).json({ 
				message: 'Notification not found', 
				error: 'NOT_FOUND',
				searchedId: id 
			});
		}
		
		return res.status(200).json({ notification: updated });
	} catch (error) {
		console.error('Mark read error:', error);
		return res.status(500).json({ message: 'Internal server error', error: 'INTERNAL_ERROR' });
	}
});

module.exports = router;
