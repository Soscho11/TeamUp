const express = require('express');
const router = express.Router();
const discussionController = require('../controllers/discussionController');
const { requireAuth } = require('../middleware/authMiddleware');

router.delete('/:id', requireAuth, discussionController.deleteDiscussion);

module.exports = router;
