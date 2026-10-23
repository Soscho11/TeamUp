const express = require('express');
const router = express.Router();
const requestController = require('../controllers/requestController');
const { requireAuth } = require('../middleware/authMiddleware');
const { validateBody } = require('../middleware/validationMiddleware');
const { validateUpdateStatus } = require('../validators/requestValidator');

// User requests: sent and received
router.get('/sent', requireAuth, requestController.getSentRequests);
router.get('/received', requireAuth, requestController.getReceivedRequests);

// Update status (accept, reject, withdraw)
router.patch('/:id/status', requireAuth, validateBody(validateUpdateStatus), requestController.updateRequestStatus);

// Delete / cancel request
router.delete('/:id', requireAuth, requestController.deleteRequest);

module.exports = router;

