function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
}

function validateRegister(body) {
  const errors = [];
  const { name, email, password, confirmPassword, university, department } = body;

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    errors.push('Full name is required');
  } else if (name.trim().length > 100) {
    errors.push('Full name cannot exceed 100 characters');
  }

  if (!email || !isValidEmail(email)) {
    errors.push('A valid email address is required');
  } else if (email.length > 255) {
    errors.push('Email cannot exceed 255 characters');
  }

  if (!password || typeof password !== 'string') {
    errors.push('Password is required');
  } else if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  if (password !== confirmPassword) {
    errors.push('Password and confirmation do not match');
  }

  if (!university || typeof university !== 'string' || university.trim().length === 0) {
    errors.push('University name is required');
  } else if (university.trim().length > 150) {
    errors.push('University name cannot exceed 150 characters');
  }

  if (!department || typeof department !== 'string' || department.trim().length === 0) {
    errors.push('Department name is required');
  } else if (department.trim().length > 150) {
    errors.push('Department name cannot exceed 150 characters');
  }

  return errors;
}

function validateLogin(body) {
  const errors = [];
  const { email, password } = body;

  if (!email || !isValidEmail(email)) {
    errors.push('A valid email address is required');
  }

  if (!password || typeof password !== 'string' || password.length === 0) {
    errors.push('Password is required');
  }

  return errors;
}

module.exports = {
  isValidEmail,
  validateRegister,
  validateLogin,
};
