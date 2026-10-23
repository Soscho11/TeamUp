const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { requireAuth } = require('../middleware/authMiddleware');
const { validateBody } = require('../middleware/validationMiddleware');
const { validateUpdateProfile, validateUserSkills } = require('../validators/userValidator');

// Public route to get platform skills list
router.get('/skills/all', userController.getAllSkills);

// Private profile routes for authenticated user
router.get('/me', requireAuth, userController.getMe);
router.patch('/me', requireAuth, validateBody(validateUpdateProfile), userController.updateMe);
router.put('/me/skills', requireAuth, validateBody(validateUserSkills), userController.updateMySkills);

// Public profile of a specific student
router.get('/:id', userController.getUserById);

module.exports = router;

