const { PROJECT_CATEGORIES, COLLABORATION_TYPES, PROJECT_STATUSES } = require('../utils/constants');
const { isValidUrl } = require('./userValidator');

function validateCreateProject(body) {
  const errors = [];
  const {
    title,
    summary,
    description,
    category,
    desired_team_size,
    collaboration_type,
    repository_url,
    goals,
    skills,
  } = body;

  if (!title || typeof title !== 'string' || title.trim().length < 3) {
    errors.push('Project title must be at least 3 characters long');
  } else if (title.trim().length > 200) {
    errors.push('Project title cannot exceed 200 characters');
  }

  if (!summary || typeof summary !== 'string' || summary.trim().length < 10) {
    errors.push('Short summary must be at least 10 characters long');
  } else if (summary.trim().length > 300) {
    errors.push('Short summary cannot exceed 300 characters');
  }

  if (!description || typeof description !== 'string' || description.trim().length < 20) {
    errors.push('Full description must be at least 20 characters long');
  }

  if (!category || !PROJECT_CATEGORIES.includes(category)) {
    errors.push(`Category is required and must be one of: ${PROJECT_CATEGORIES.join(', ')}`);
  }

  const teamSizeNum = parseInt(desired_team_size, 10);
  if (isNaN(teamSizeNum) || teamSizeNum < 2 || teamSizeNum > 20) {
    errors.push('Desired team size must be an integer between 2 and 20');
  }

  if (collaboration_type && !COLLABORATION_TYPES.includes(collaboration_type)) {
    errors.push(`Collaboration type must be one of: ${COLLABORATION_TYPES.join(', ')}`);
  }

  if (repository_url !== undefined && repository_url !== null && repository_url.trim() !== '') {
    if (!isValidUrl(repository_url)) {
      errors.push('Repository URL must be a valid URL starting with http:// or https://');
    } else if (repository_url.length > 255) {
      errors.push('Repository URL cannot exceed 255 characters');
    }
  }

  if (goals !== undefined && goals !== null && typeof goals === 'string' && goals.length > 2000) {
    errors.push('Project goals cannot exceed 2000 characters');
  }

  if (skills !== undefined && skills !== null) {
    if (!Array.isArray(skills)) {
      errors.push('Required skills must be an array');
    } else if (skills.length > 20) {
      errors.push('You cannot specify more than 20 required skills');
    }
  }

  return errors;
}

function validateUpdateProject(body) {
  const errors = [];
  const {
    title,
    summary,
    description,
    category,
    desired_team_size,
    collaboration_type,
    repository_url,
    status,
    goals,
    skills,
  } = body;

  if (title !== undefined) {
    if (typeof title !== 'string' || title.trim().length < 3) {
      errors.push('Project title must be at least 3 characters long');
    } else if (title.trim().length > 200) {
      errors.push('Project title cannot exceed 200 characters');
    }
  }

  if (summary !== undefined) {
    if (typeof summary !== 'string' || summary.trim().length < 10) {
      errors.push('Short summary must be at least 10 characters long');
    } else if (summary.trim().length > 300) {
      errors.push('Short summary cannot exceed 300 characters');
    }
  }

  if (description !== undefined) {
    if (typeof description !== 'string' || description.trim().length < 20) {
      errors.push('Full description must be at least 20 characters long');
    }
  }

  if (category !== undefined && !PROJECT_CATEGORIES.includes(category)) {
    errors.push(`Category must be one of: ${PROJECT_CATEGORIES.join(', ')}`);
  }

  if (desired_team_size !== undefined) {
    const teamSizeNum = parseInt(desired_team_size, 10);
    if (isNaN(teamSizeNum) || teamSizeNum < 2 || teamSizeNum > 20) {
      errors.push('Desired team size must be an integer between 2 and 20');
    }
  }

  if (collaboration_type !== undefined && !COLLABORATION_TYPES.includes(collaboration_type)) {
    errors.push(`Collaboration type must be one of: ${COLLABORATION_TYPES.join(', ')}`);
  }

  if (status !== undefined && !PROJECT_STATUSES.includes(status)) {
    errors.push(`Status must be one of: ${PROJECT_STATUSES.join(', ')}`);
  }

  if (repository_url !== undefined && repository_url !== null && repository_url.trim() !== '') {
    if (!isValidUrl(repository_url)) {
      errors.push('Repository URL must be a valid URL starting with http:// or https://');
    } else if (repository_url.length > 255) {
      errors.push('Repository URL cannot exceed 255 characters');
    }
  }

  if (goals !== undefined && goals !== null && typeof goals === 'string' && goals.length > 2000) {
    errors.push('Project goals cannot exceed 2000 characters');
  }

  if (skills !== undefined && skills !== null) {
    if (!Array.isArray(skills)) {
      errors.push('Required skills must be an array');
    } else if (skills.length > 20) {
      errors.push('You cannot specify more than 20 required skills');
    }
  }

  return errors;
}

module.exports = {
  validateCreateProject,
  validateUpdateProject,
};
