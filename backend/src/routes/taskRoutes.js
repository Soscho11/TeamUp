const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const { requireAuth } = require('../middleware/authMiddleware');

router.patch('/:id', requireAuth, taskController.updateTask);
router.delete('/:id', requireAuth, taskController.deleteTask);

module.exports = router;
