const { pool } = require('../config/db');

async function isTeamMemberOrOwner(projectId, userId) {
  if (!userId) return false;
  const [rows] = await pool.execute(
    `SELECT 1 FROM projects p 
     LEFT JOIN project_members pm ON p.id = pm.project_id AND pm.user_id = ? AND pm.membership_status = 'active'
     WHERE p.id = ? AND (p.owner_id = ? OR pm.id IS NOT NULL)`,
    [userId, projectId, userId]
  );
  return rows.length > 0;
}

async function getProjectDiscussions(projectId, currentUserId = null, type = 'public_qa') {
  // If team_internal, verify access
  if (type === 'team_internal') {
    const authorized = await isTeamMemberOrOwner(projectId, currentUserId);
    if (!authorized) {
      const error = new Error('Unauthorized. Team discussion is restricted to project members.');
      error.statusCode = 403;
      throw error;
    }
  }

  const [discussions] = await pool.execute(
    `SELECT 
      d.id,
      d.project_id,
      d.user_id,
      d.content,
      d.type,
      d.created_at,
      d.updated_at,
      u.name AS author_name,
      u.university AS author_university,
      u.department AS author_department,
      p.owner_id,
      CASE 
        WHEN d.user_id = p.owner_id THEN 'Owner'
        WHEN pm.id IS NOT NULL THEN 'Team Member'
        ELSE 'Student'
      END AS author_role
     FROM project_discussions d
     JOIN users u ON d.user_id = u.id
     JOIN projects p ON d.project_id = p.id
     LEFT JOIN project_members pm ON p.id = pm.project_id AND pm.user_id = d.user_id AND pm.membership_status = 'active'
     WHERE d.project_id = ? AND d.type = ?
     ORDER BY d.created_at ASC`,
    [projectId, type]
  );

  return discussions;
}

async function createDiscussion(projectId, userId, { content, type = 'public_qa' }) {
  if (!content || !content.trim()) {
    const error = new Error('Discussion message content cannot be empty');
    error.statusCode = 422;
    throw error;
  }

  // 1. Verify project exists
  const [projects] = await pool.execute('SELECT id, owner_id, title FROM projects WHERE id = ?', [projectId]);
  if (projects.length === 0) {
    const error = new Error('Project not found');
    error.statusCode = 404;
    throw error;
  }
  const project = projects[0];

  // 2. If internal discussion, verify user is active team member or owner
  if (type === 'team_internal') {
    const authorized = await isTeamMemberOrOwner(projectId, userId);
    if (!authorized) {
      const error = new Error('Unauthorized. Only active team members can participate in internal discussions.');
      error.statusCode = 403;
      throw error;
    }
  }

  // 3. Insert discussion message
  const [result] = await pool.execute(
    `INSERT INTO project_discussions (project_id, user_id, content, type)
     VALUES (?, ?, ?, ?)`,
    [projectId, userId, content.trim(), type]
  );

  // 4. If public question from a non-owner, send notification to project owner
  if (type === 'public_qa' && userId !== project.owner_id) {
    try {
      const [author] = await pool.execute('SELECT name FROM users WHERE id = ?', [userId]);
      const authorName = author.length > 0 ? author[0].name : 'A student';
      await pool.execute(
        `INSERT INTO notifications (user_id, type, title, message, related_project_id)
         VALUES (?, 'project_status_changed', ?, ?, ?)`,
        [
          project.owner_id,
          'New question on your project',
          `${authorName} posted a question in "${project.title}" Q&A board.`,
          projectId,
        ]
      );
    } catch (notifErr) {
      // Don't fail discussion post if notification fails
    }
  }

  return {
    id: result.insertId,
    project_id: projectId,
    user_id: userId,
    content: content.trim(),
    type,
    created_at: new Date().toISOString(),
  };
}

async function deleteDiscussion(discussionId, userId) {
  const [rows] = await pool.execute(
    `SELECT d.id, d.user_id, p.owner_id 
     FROM project_discussions d
     JOIN projects p ON d.project_id = p.id
     WHERE d.id = ?`,
    [discussionId]
  );

  if (rows.length === 0) {
    const error = new Error('Discussion message not found');
    error.statusCode = 404;
    throw error;
  }

  const msg = rows[0];
  if (msg.user_id !== userId && msg.owner_id !== userId) {
    const error = new Error('Unauthorized. You can only delete your own messages or messages in projects you own.');
    error.statusCode = 403;
    throw error;
  }

  await pool.execute('DELETE FROM project_discussions WHERE id = ?', [discussionId]);
  return { message: 'Message deleted successfully' };
}

module.exports = {
  getProjectDiscussions,
  createDiscussion,
  deleteDiscussion,
};
