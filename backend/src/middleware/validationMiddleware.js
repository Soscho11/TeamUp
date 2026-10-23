const { errorResponse } = require('../utils/apiResponse');

function validateBody(validatorFn) {
  return (req, res, next) => {
    const errors = validatorFn(req.body);
    if (errors && errors.length > 0) {
      return errorResponse(res, 'Validation failed', errors, 422);
    }
    next();
  };
}

module.exports = {
  validateBody,
};
