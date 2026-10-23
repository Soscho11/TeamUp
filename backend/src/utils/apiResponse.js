function successResponse(res, message, data = null, statusCode = 200) {
  const response = {
    success: true,
    message,
  };
  if (data !== null) {
    response.data = data;
  }
  return res.status(statusCode).json(response);
}

function errorResponse(res, message, errors = [], statusCode = 400) {
  const response = {
    success: false,
    message,
    errors: Array.isArray(errors) ? errors : [errors],
  };
  return res.status(statusCode).json(response);
}

module.exports = {
  successResponse,
  errorResponse,
};
