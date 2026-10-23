const express = require('express');
const router = express.Router();
const { testConnection } = require('../config/db');
const { successResponse, errorResponse } = require('../utils/apiResponse');

router.get('/', async (req, res) => {
  try {
    await testConnection();
    return successResponse(res, 'TeamUp backend service is healthy', {
      status: 'healthy',
      database: 'connected',
      uptime: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    return errorResponse(res, 'Service degraded: Database connection error', {
      status: 'degraded',
      database: 'disconnected',
      timestamp: new Date().toISOString(),
    }, 503);
  }
});

module.exports = router;
