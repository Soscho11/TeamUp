const { PROFICIENCY_LEVELS } = require('../utils/constants');

function isValidUrl(urlString) {
  if (!urlString || typeof urlString !== 'string') return false;
  try {
    const url = new URL(urlString.trim());
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (err) {
    return false;
  }
}

function validateUpdateProfile(body) {
  const errors = [];
  const { name, university, department, bio, github_url, portfolio_url } = body;

  if (name !== undefined) {
    if (typeof name !== 'string' || name.trim().length === 0) {
      errors.push('Name cannot be empty');
    } else if (name.trim().length > 100) {
      errors.push('Name cannot exceed 100 characters');
    }
  }

  if (university !== undefined) {
    if (typeof university !== 'string' || university.trim().length === 0) {
      errors.push('University cannot be empty');
    } else if (university.trim().length > 150) {
      errors.push('University cannot exceed 150 characters');
    }
  }

  if (department !== undefined) {
    if (typeof department !== 'string' || department.trim().length === 0) {
      errors.push('Department cannot be empty');
    } else if (department.trim().length > 150) {
      errors.push('Department cannot exceed 150 characters');
    }
  }

  if (bio !== undefined && bio !== null && typeof bio === 'string' && bio.length > 2000) {
    errors.push('Biography cannot exceed 2000 characters');
  }

  if (github_url !== undefined && github_url !== null && github_url.trim() !== '') {
    if (!isValidUrl(github_url)) {
      errors.push('GitHub URL must be a valid URL starting with http:// or https://');
    } else if (github_url.length > 255) {
      errors.push('GitHub URL cannot exceed 255 characters');
    }
  }

  if (portfolio_url !== undefined && portfolio_url !== null && portfolio_url.trim() !== '') {
    if (!isValidUrl(portfolio_url)) {
      errors.push('Portfolio URL must be a valid URL starting with http:// or https://');
    } else if (portfolio_url.length > 255) {
      errors.push('Portfolio URL cannot exceed 255 characters');
    }
  }

  return errors;
}

function validateUserSkills(body) {
  const errors = [];
  const { skills } = body;

  if (!Array.isArray(skills)) {
    errors.push('Skills must be provided as an array');
    return errors;
  }

  if (skills.length > 30) {
    errors.push('A maximum of 30 skills can be associated with your profile');
  }

  for (let i = 0; i < skills.length; i++) {
    const skill = skills[i];
    if (typeof skill === 'string') {
      if (skill.trim().length === 0 || skill.trim().length > 100) {
        errors.push(`Skill #${i + 1} name must be between 1 and 100 characters`);
      }
    } else if (typeof skill === 'object' && skill !== null) {
      if (!skill.name || typeof skill.name !== 'string' || skill.name.trim().length === 0) {
        errors.push(`Skill #${i + 1} must include a valid name`);
      }
      if (skill.proficiency_level && !PROFICIENCY_LEVELS.includes(skill.proficiency_level)) {
        errors.push(`Invalid proficiency level for skill "${skill.name}". Must be beginner, intermediate, or advanced.`);
      }
    } else {
      errors.push(`Skill #${i + 1} is invalid`);
    }
  }

  return errors;
}

module.exports = {
  isValidUrl,
  validateUpdateProfile,
  validateUserSkills,
};

