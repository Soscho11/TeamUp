const { pool } = require('../config/db');

async function getProfile(userId) {
  const [users] = await pool.execute(
    `SELECT id, name, email, university, department, bio, github_url, portfolio_url, created_at, updated_at
     FROM users WHERE id = ?`,
    [userId]
  );

  if (users.length === 0) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  const user = users[0];

  // Get user skills
  const [skills] = await pool.execute(
    `SELECT s.id, s.name, us.proficiency_level
     FROM user_skills us
     JOIN skills s ON us.skill_id = s.id
     WHERE us.user_id = ?
     ORDER BY s.name ASC`,
    [userId]
  );
  user.skills = skills;

  // Get user projects created
  const [createdProjects] = await pool.execute(
    `SELECT p.id, p.title, p.summary, p.category, p.status, p.desired_team_size, p.created_at,
            (SELECT COUNT(*) FROM project_members pm WHERE pm.project_id = p.id AND pm.membership_status = 'active') AS current_members
     FROM projects p
     WHERE p.owner_id = ?
     ORDER BY p.created_at DESC`,
    [userId]
  );
  user.created_projects = createdProjects;

  // Get team memberships (projects user joined as non-owner or member)
  const [memberships] = await pool.execute(
    `SELECT p.id, p.title, p.category, p.status, pm.role, pm.joined_at, u.name AS owner_name
     FROM project_members pm
     JOIN projects p ON pm.project_id = p.id
     JOIN users u ON p.owner_id = u.id
     WHERE pm.user_id = ? AND pm.membership_status = 'active'
     ORDER BY pm.joined_at DESC`,
    [userId]
  );
  user.memberships = memberships;

  return user;
}

async function updateProfile(userId, updateData) {
  const allowedFields = ['name', 'university', 'department', 'bio', 'github_url', 'portfolio_url'];
  const fields = [];
  const values = [];

  for (const field of allowedFields) {
    if (updateData[field] !== undefined) {
      fields.push(`${field} = ?`);
      values.push(updateData[field] === '' ? null : updateData[field]);
    }
  }

  if (fields.length === 0) {
    return getProfile(userId);
  }

  values.push(userId);
  await pool.execute(
    `UPDATE users SET ${fields.join(', ')} WHERE id = ?`,
    values
  );

  return getProfile(userId);
}

async function updateSkills(userId, skills) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // 1. Remove existing user_skills
    await connection.execute('DELETE FROM user_skills WHERE user_id = ?', [userId]);

    // 2. Process each skill
    for (const item of skills) {
      let skillName = '';
      let proficiency = 'intermediate';

      if (typeof item === 'string') {
        skillName = item.trim();
      } else if (typeof item === 'object' && item !== null) {
        skillName = (item.name || '').trim();
        if (item.proficiency_level) {
          proficiency = item.proficiency_level;
        }
      }

      if (!skillName) continue;

      const normalized = skillName.toLowerCase();

      // Find or insert into master skills
      const [existingSkill] = await connection.execute(
        'SELECT id FROM skills WHERE normalized_name = ?',
        [normalized]
      );

      let skillId;
      if (existingSkill.length > 0) {
        skillId = existingSkill[0].id;
      } else {
        const [insertResult] = await connection.execute(
          'INSERT INTO skills (name, normalized_name) VALUES (?, ?)',
          [skillName, normalized]
        );
        skillId = insertResult.insertId;
      }

      // Insert into user_skills
      await connection.execute(
        `INSERT INTO user_skills (user_id, skill_id, proficiency_level)
         VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE proficiency_level = VALUES(proficiency_level)`,
        [userId, skillId, proficiency]
      );
    }

    await connection.commit();
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }

  return getProfile(userId);
}

async function getUserById(targetId) {
  const [users] = await pool.execute(
    `SELECT id, name, university, department, bio, github_url, portfolio_url, created_at
     FROM users WHERE id = ?`,
    [targetId]
  );

  if (users.length === 0) {
    const error = new Error('Student profile not found');
    error.statusCode = 404;
    throw error;
  }

  const user = users[0];

  const [skills] = await pool.execute(
    `SELECT s.id, s.name, us.proficiency_level
     FROM user_skills us
     JOIN skills s ON us.skill_id = s.id
     WHERE us.user_id = ?
     ORDER BY s.name ASC`,
    [targetId]
  );
  user.skills = skills;

  const [createdProjects] = await pool.execute(
    `SELECT p.id, p.title, p.summary, p.category, p.status, p.desired_team_size, p.created_at,
            (SELECT COUNT(*) FROM project_members pm WHERE pm.project_id = p.id AND pm.membership_status = 'active') AS current_members
     FROM projects p
     WHERE p.owner_id = ?
     ORDER BY p.created_at DESC`,
    [targetId]
  );
  user.created_projects = createdProjects;

  return user;
}

async function getAllSkills() {
  const [rows] = await pool.execute(
    'SELECT id, name, normalized_name FROM skills ORDER BY name ASC'
  );
  return rows;
}

module.exports = {
  getProfile,
  updateProfile,
  updateSkills,
  getUserById,
  getAllSkills,
};
