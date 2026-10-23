const { REQUEST_STATUSES } = require('../utils/constants');

function validateCreateRequest(body) {
  const errors = [];
  const { message } = body;

  if (message !== undefined && message !== null) {
    if (typeof message !== 'string') {
      errors.push('Message must be text');
    } else if (message.length > 1000) {
      errors.push('Message cannot exceed 1000 characters');
    }
  }

  return errors;
}

function validateUpdateStatus(body) {
  const errors = [];
  const { status } = body;

  if (!status || !REQUEST_STATUSES.includes(status)) {
    errors.push(`Status must be one of: ${REQUEST_STATUSES.join(', ')}`);
  }

  return errors;
}

module.exports = {
  validateCreateRequest,
  validateUpdateStatus,
};

