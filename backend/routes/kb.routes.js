const express = require('express');
const router = express.Router();
const { auth, requireAdmin } = require('../middlewares/auth.middleware');
const {
	listKBArticles,
	getKBArticle,
	createKBArticle,
	updateKBArticle,
	deleteKBArticle,
} = require('../controllers/kb.controller');

// Public: search/list and get single published article
router.get('/', listKBArticles);
router.get('/:id', getKBArticle);

// Admin only: create/update/delete
router.post('/', auth, requireAdmin, createKBArticle);
router.put('/:id', auth, requireAdmin, updateKBArticle);
router.delete('/:id', auth, requireAdmin, deleteKBArticle);

module.exports = router;
