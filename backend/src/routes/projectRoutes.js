const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const requestController = require('../controllers/requestController');
const teamController = require('../controllers/teamController');
const { requireAuth, optionalAuth } = require('../middleware/authMiddleware');
const { validateBody } = require('../middleware/validationMiddleware');
const { validateCreateProject, validateUpdateProject } = require('../validators/projectValidator');
const { validateCreateRequest } = require('../validators/requestValidator');

// Discovery & listings
router.get('/', optionalAuth, projectController.getProjects);

// User specific dashboard & projects (before :id)
router.get('/dashboard', requireAuth, projectController.getDashboard);
router.get('/my', requireAuth, projectController.getMyProjects);

// Create project
router.post('/', requireAuth, validateBody(validateCreateProject), projectController.createProject);

// Single project operations
router.get('/:id', optionalAuth, projectController.getProjectById);
router.patch('/:id', requireAuth, validateBody(validateUpdateProject), projectController.updateProject);
router.delete('/:id', requireAuth, projectController.deleteProject);

// Join requests for this project
router.post('/:id/requests', requireAuth, validateBody(validateCreateRequest), requestController.createJoinRequest);

// Team management for this project
router.get('/:id/members', teamController.getProjectMembers);
router.delete('/:id/members/:userId', requireAuth, teamController.removeMember);

module.exports = router;
