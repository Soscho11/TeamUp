const { pool } = require('../config/db');

async function toggleBookmark(userId, projectId) {
  // 1. Verify project exists
  const [project] = await pool.execute('SELECT id, title FROM projects WHERE id = ?', [projectId]);
  if (project.length === 0) {
    const error = new Error('Project not found');
    error.statusCode = 404;
    throw error;
  }

  // 2. Check if already bookmarked
  const [existing] = await pool.execute(
    'SELECT 1 FROM bookmarks WHERE user_id = ? AND project_id = ?',
    [userId, projectId]
  );

  if (existing.length > 0) {
    await pool.execute('DELETE FROM bookmarks WHERE user_id = ? AND project_id = ?', [
      userId,
      projectId,
    ]);
    return { is_bookmarked: false, message: 'Project removed from bookmarks' };
  } else {
    await pool.execute(
      'INSERT INTO bookmarks (user_id, project_id) VALUES (?, ?)',
      [userId, projectId]
    );
    return { is_bookmarked: true, message: 'Project saved to bookmarks' };
  }
}

async function getUserBookmarks(userId) {
  const [rows] = await pool.execute(
    `SELECT 
      p.id,
      p.owner_id,
      p.title,
      p.summary,
      p.description,
      p.category,
      p.desired_team_size,
      p.collaboration_type,
      p.repository_url,
      p.status,
      p.created_at,
      p.updated_at,
      u.name AS owner_name,
      u.university AS owner_university,
      u.department AS owner_department,
      (SELECT COUNT(*) FROM project_members pm WHERE pm.project_id = p.id AND pm.membership_status = 'active') AS current_members,
      b.created_at AS bookmarked_at
     FROM bookmarks b
     JOIN projects p ON b.project_id = p.id
     JOIN users u ON p.owner_id = u.id
     WHERE b.user_id = ?
     ORDER BY b.created_at DESC`,
    [userId]
  );

  if (rows.length > 0) {
    const projectIds = rows.map((p) => p.id);
    const placeholders = projectIds.map(() => '?').join(',');
    const [skillRows] = await pool.execute(
      `SELECT ps.project_id, s.id, s.name
       FROM project_skills ps
       JOIN skills s ON ps.skill_id = s.id
       WHERE ps.project_id IN (${placeholders})
       ORDER BY s.name ASC`,
      projectIds
    );

    const skillsByProjectId = {};
    for (const s of skillRows) {
      if (!skillsByProjectId[s.project_id]) skillsByProjectId[s.project_id] = [];
      skillsByProjectId[s.project_id].push({ id: s.id, name: s.name });
    }

    for (const p of rows) {
      p.skills = skillsByProjectId[p.id] || [];
      p.available_capacity = Math.max(0, p.desired_team_size - p.current_members);
      p.is_bookmarked = true;
    }
  }

  return rows;
}

module.exports = {
  toggleBookmark,
  getUserBookmarks,
};
