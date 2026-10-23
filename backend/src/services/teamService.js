const { pool } = require('../config/db');
const { createNotification } = require('./notificationService');

async function getProjectMembers(projectId) {
  const [members] = await pool.execute(
    `SELECT pm.id AS membership_id, pm.project_id, pm.user_id, pm.role, pm.membership_status, pm.joined_at,
            u.name, u.email, u.university, u.department, u.bio, u.github_url, u.portfolio_url
     FROM project_members pm
     JOIN users u ON pm.user_id = u.id
     WHERE pm.project_id = ? AND pm.membership_status = 'active'
     ORDER BY (pm.role = 'Owner') DESC, pm.joined_at ASC`,
    [projectId]
  );

  if (members.length > 0) {
    const userIds = members.map((m) => m.user_id);
    const placeholders = userIds.map(() => '?').join(',');
    const [skillRows] = await pool.execute(
      `SELECT us.user_id, s.name, us.proficiency_level
       FROM user_skills us
       JOIN skills s ON us.skill_id = s.id
       WHERE us.user_id IN (${placeholders})`,
      userIds
    );

    const skillsByUser = {};
    for (const s of skillRows) {
      if (!skillsByUser[s.user_id]) skillsByUser[s.user_id] = [];
      skillsByUser[s.user_id].push({ name: s.name, proficiency_level: s.proficiency_level });
    }

    for (const m of members) {
      m.skills = skillsByUser[m.user_id] || [];
    }
  }

  return members;
}

async function removeMember(projectId, memberUserId, requestingUserId) {
  // 1. Check project and ownership
  const [projects] = await pool.execute(
    'SELECT owner_id, title FROM projects WHERE id = ?',
    [projectId]
  );

  if (projects.length === 0) {
    const error = new Error('Project not found');
    error.statusCode = 404;
    throw error;
  }

  const project = projects[0];

  if (project.owner_id !== requestingUserId) {
    const error = new Error('Unauthorized. Only the project owner can remove team members.');
    error.statusCode = 403;
    throw error;
  }

  if (project.owner_id === memberUserId) {
    const error = new Error('The project owner cannot be removed from the team.');
    error.statusCode = 400;
    throw error;
  }

  // 2. Check membership
  const [members] = await pool.execute(
    'SELECT id FROM project_members WHERE project_id = ? AND user_id = ? AND membership_status = "active"',
    [projectId, memberUserId]
  );

  if (members.length === 0) {
    const error = new Error('Member is not an active participant of this project.');
    error.statusCode = 404;
    throw error;
  }

  // 3. Remove membership
  await pool.execute(
    'DELETE FROM project_members WHERE project_id = ? AND user_id = ?',
    [projectId, memberUserId]
  );

  // 4. Send notification to removed user
  await createNotification({
    userId: memberUserId,
    type: 'member_removed',
    title: 'Team Membership Update',
    message: `You were removed from the project "${project.title}".`,
    relatedProjectId: projectId,
  });

  return true;
}

module.exports = {
  getProjectMembers,
  removeMember,
};

