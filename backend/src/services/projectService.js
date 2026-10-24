const { pool } = require('../config/db');

async function createProject(ownerId, projectData) {
  const {
    title,
    summary,
    description,
    category,
    desired_team_size = 4,
    collaboration_type = 'academic',
    repository_url = null,
    goals = null,
    skills = [],
  } = projectData;

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // 1. Insert project
    const [projectResult] = await connection.execute(
      `INSERT INTO projects (owner_id, title, summary, description, category, desired_team_size, collaboration_type, repository_url, goals)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        ownerId,
        title.trim(),
        summary.trim(),
        description.trim(),
        category,
        parseInt(desired_team_size, 10),
        collaboration_type,
        repository_url ? repository_url.trim() : null,
        goals ? goals.trim() : null,
      ]
    );

    const projectId = projectResult.insertId;

    // 2. Add owner as active member
    await connection.execute(
      `INSERT INTO project_members (project_id, user_id, role, membership_status)
       VALUES (?, ?, 'Owner', 'active')`,
      [projectId, ownerId]
    );

    // 3. Insert skills
    if (Array.isArray(skills) && skills.length > 0) {
      for (const skillName of skills) {
        if (!skillName || typeof skillName !== 'string') continue;
        const trimmed = skillName.trim();
        if (!trimmed) continue;
        const normalized = trimmed.toLowerCase();

        // Find or create in skills table
        const [existing] = await connection.execute(
          'SELECT id FROM skills WHERE normalized_name = ?',
          [normalized]
        );

        let skillId;
        if (existing.length > 0) {
          skillId = existing[0].id;
        } else {
          const [ins] = await connection.execute(
            'INSERT INTO skills (name, normalized_name) VALUES (?, ?)',
            [trimmed, normalized]
          );
          skillId = ins.insertId;
        }

        // Link project_skills
        await connection.execute(
          `INSERT INTO project_skills (project_id, skill_id)
           VALUES (?, ?)
           ON DUPLICATE KEY UPDATE skill_id = VALUES(skill_id)`,
          [projectId, skillId]
        );
      }
    }

    await connection.commit();
    return getProjectById(projectId, ownerId);
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

async function getProjects({
  search = '',
  category = '',
  skill = '',
  status = '',
  page = 1,
  limit = 9,
  sortBy = 'created_at',
  order = 'DESC',
  currentUserId = null,
  recommended = false,
} = {}) {
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 9));
  const offset = (pageNum - 1) * limitNum;

  const validSortColumns = {
    created_at: 'p.created_at',
    title: 'p.title',
    desired_team_size: 'p.desired_team_size',
  };
  const sortColumn = validSortColumns[sortBy] || 'p.created_at';
  const sortOrder = order && order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

  const conditions = [];
  const params = [];

  if (category) {
    conditions.push('p.category = ?');
    params.push(category);
  }

  if (status) {
    conditions.push('p.status = ?');
    params.push(status);
  }

  if (search && search.trim() !== '') {
    conditions.push('(p.title LIKE ? OR p.summary LIKE ? OR p.description LIKE ?)');
    const searchTerm = `%${search.trim()}%`;
    params.push(searchTerm, searchTerm, searchTerm);
  }

  if (skill && skill.trim() !== '') {
    conditions.push(`
      EXISTS (
        SELECT 1 FROM project_skills ps
        JOIN skills s ON ps.skill_id = s.id
        WHERE ps.project_id = p.id AND (s.name LIKE ? OR s.normalized_name LIKE ?)
      )
    `);
    const skillTerm = `%${skill.trim().toLowerCase()}%`;
    params.push(skillTerm, skillTerm);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  // 1. Get total count
  const countQuery = `SELECT COUNT(*) AS total FROM projects p ${whereClause}`;
  const [countResult] = await pool.execute(countQuery, params);
  const total = countResult[0].total;

  // 2. Fetch page rows
  const query = `
    SELECT 
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
      (SELECT COUNT(*) FROM project_members pm WHERE pm.project_id = p.id AND pm.membership_status = 'active') AS current_members
    FROM projects p
    JOIN users u ON p.owner_id = u.id
    ${whereClause}
    ORDER BY ${sortColumn} ${sortOrder}
    LIMIT ? OFFSET ?
  `;

  const queryParams = [...params, limitNum, offset];
  const [projects] = await pool.execute(query, queryParams);

  // 3. Attach skills to each project
  if (projects.length > 0) {
    const projectIds = projects.map((p) => p.id);
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
    for (const row of skillRows) {
      if (!skillsByProjectId[row.project_id]) {
        skillsByProjectId[row.project_id] = [];
      }
      skillsByProjectId[row.project_id].push({ id: row.id, name: row.name });
    }

    for (const project of projects) {
      project.skills = skillsByProjectId[project.id] || [];
      project.available_capacity = Math.max(0, project.desired_team_size - project.current_members);
    }

    // 4. Attach bookmark status and skill matching for authenticated user
    if (currentUserId) {
      const [bookmarks] = await pool.execute(
        `SELECT project_id FROM bookmarks WHERE user_id = ? AND project_id IN (${placeholders})`,
        [currentUserId, ...projectIds]
      );
      const bookmarkedSet = new Set(bookmarks.map((b) => b.project_id));

      const [userSkills] = await pool.execute(
        `SELECT LOWER(s.name) AS skill_name
         FROM user_skills us
         JOIN skills s ON us.skill_id = s.id
         WHERE us.user_id = ?`,
        [currentUserId]
      );
      const userSkillNames = new Set(userSkills.map((s) => s.skill_name));

      for (const project of projects) {
        project.is_bookmarked = bookmarkedSet.has(project.id);
        const matched = project.skills.filter((sk) => userSkillNames.has(sk.name.toLowerCase()));
        project.matched_skills = matched;
        project.match_percentage = project.skills.length > 0
          ? Math.round((matched.length / project.skills.length) * 100)
          : 0;
      }

      if (recommended === 'true' || recommended === true) {
        projects.sort((a, b) => b.match_percentage - a.match_percentage);
      }
    } else {
      for (const project of projects) {
        project.is_bookmarked = false;
        project.matched_skills = [];
        project.match_percentage = 0;
      }
    }
  }

  return {
    projects,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum) || 1,
    },
  };
}

async function getProjectById(projectId, currentUserId = null) {
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
      p.goals,
      p.created_at,
      p.updated_at,
      u.name AS owner_name,
      u.email AS owner_email,
      u.university AS owner_university,
      u.department AS owner_department,
      u.github_url AS owner_github,
      (SELECT COUNT(*) FROM project_members pm WHERE pm.project_id = p.id AND pm.membership_status = 'active') AS current_members
    FROM projects p
    JOIN users u ON p.owner_id = u.id
    WHERE p.id = ?`,
    [projectId]
  );

  if (rows.length === 0) {
    const error = new Error('Project not found');
    error.statusCode = 404;
    throw error;
  }

  const project = rows[0];
  project.available_capacity = Math.max(0, project.desired_team_size - project.current_members);

  // Fetch project skills
  const [skills] = await pool.execute(
    `SELECT s.id, s.name
     FROM project_skills ps
     JOIN skills s ON ps.skill_id = s.id
     WHERE ps.project_id = ?
     ORDER BY s.name ASC`,
    [projectId]
  );
  project.skills = skills;

  // Fetch active project members
  const [members] = await pool.execute(
    `SELECT pm.id AS membership_id, pm.user_id, pm.role, pm.membership_status, pm.joined_at,
            u.name, u.email, u.university, u.department, u.github_url, u.portfolio_url
     FROM project_members pm
     JOIN users u ON pm.user_id = u.id
     WHERE pm.project_id = ? AND pm.membership_status = 'active'
     ORDER BY (pm.role = 'Owner') DESC, pm.joined_at ASC`,
    [projectId]
  );
  project.members = members;

  // Fetch membership & request state for current user
  if (currentUserId) {
    project.is_owner = project.owner_id === currentUserId;
    project.is_member = members.some((m) => m.user_id === currentUserId);

    const [userReq] = await pool.execute(
      `SELECT id, status, message, created_at
       FROM join_requests
       WHERE project_id = ? AND user_id = ?
       ORDER BY created_at DESC
       LIMIT 1`,
      [projectId, currentUserId]
    );

    project.user_request = userReq.length > 0 ? userReq[0] : null;

    // Check if user has bookmarked this project
    const [bm] = await pool.execute(
      'SELECT 1 FROM bookmarks WHERE user_id = ? AND project_id = ?',
      [currentUserId, projectId]
    );
    project.is_bookmarked = bm.length > 0;

    // Calculate skill match
    const [userSkills] = await pool.execute(
      `SELECT LOWER(s.name) AS skill_name
       FROM user_skills us
       JOIN skills s ON us.skill_id = s.id
       WHERE us.user_id = ?`,
      [currentUserId]
    );
    const userSkillNames = new Set(userSkills.map((s) => s.skill_name));
    const matched = project.skills.filter((sk) => userSkillNames.has(sk.name.toLowerCase()));
    project.matched_skills = matched;
    project.match_percentage = project.skills.length > 0
      ? Math.round((matched.length / project.skills.length) * 100)
      : 0;
  } else {
    project.is_owner = false;
    project.is_member = false;
    project.user_request = null;
    project.is_bookmarked = false;
    project.matched_skills = [];
    project.match_percentage = 0;
  }

  return project;
}

async function updateProject(projectId, userId, updateData) {
  const [existing] = await pool.execute(
    'SELECT owner_id FROM projects WHERE id = ?',
    [projectId]
  );

  if (existing.length === 0) {
    const error = new Error('Project not found');
    error.statusCode = 404;
    throw error;
  }

  if (existing[0].owner_id !== userId) {
    const error = new Error('Unauthorized. You can only update projects that you own.');
    error.statusCode = 403;
    throw error;
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const allowedFields = [
      'title',
      'summary',
      'description',
      'category',
      'desired_team_size',
      'collaboration_type',
      'repository_url',
      'status',
      'goals',
    ];

    const fields = [];
    const values = [];

    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        fields.push(`${field} = ?`);
        if (field === 'desired_team_size') {
          values.push(parseInt(updateData[field], 10));
        } else if (updateData[field] === '') {
          values.push(null);
        } else {
          values.push(updateData[field]);
        }
      }
    }

    if (fields.length > 0) {
      values.push(projectId);
      await connection.execute(
        `UPDATE projects SET ${fields.join(', ')} WHERE id = ?`,
        values
      );
    }

    // Update skills if provided
    if (updateData.skills !== undefined && Array.isArray(updateData.skills)) {
      await connection.execute('DELETE FROM project_skills WHERE project_id = ?', [projectId]);

      for (const skillName of updateData.skills) {
        if (!skillName || typeof skillName !== 'string') continue;
        const trimmed = skillName.trim();
        if (!trimmed) continue;
        const normalized = trimmed.toLowerCase();

        const [existingSkill] = await connection.execute(
          'SELECT id FROM skills WHERE normalized_name = ?',
          [normalized]
        );

        let skillId;
        if (existingSkill.length > 0) {
          skillId = existingSkill[0].id;
        } else {
          const [ins] = await connection.execute(
            'INSERT INTO skills (name, normalized_name) VALUES (?, ?)',
            [trimmed, normalized]
          );
          skillId = ins.insertId;
        }

        await connection.execute(
          `INSERT INTO project_skills (project_id, skill_id)
           VALUES (?, ?)
           ON DUPLICATE KEY UPDATE skill_id = VALUES(skill_id)`,
          [projectId, skillId]
        );
      }
    }

    await connection.commit();
    return getProjectById(projectId, userId);
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

async function deleteProject(projectId, userId) {
  const [existing] = await pool.execute(
    'SELECT owner_id FROM projects WHERE id = ?',
    [projectId]
  );

  if (existing.length === 0) {
    const error = new Error('Project not found');
    error.statusCode = 404;
    throw error;
  }

  if (existing[0].owner_id !== userId) {
    const error = new Error('Unauthorized. You can only delete projects that you own.');
    error.statusCode = 403;
    throw error;
  }

  await pool.execute('DELETE FROM projects WHERE id = ?', [projectId]);
  return true;
}

async function getUserProjects(userId) {
  const [projects] = await pool.execute(
    `SELECT 
      p.id,
      p.title,
      p.summary,
      p.category,
      p.desired_team_size,
      p.status,
      p.created_at,
      p.updated_at,
      (SELECT COUNT(*) FROM project_members pm WHERE pm.project_id = p.id AND pm.membership_status = 'active') AS current_members,
      (SELECT COUNT(*) FROM join_requests jr WHERE jr.project_id = p.id AND jr.status = 'pending') AS pending_requests_count
     FROM projects p
     WHERE p.owner_id = ?
     ORDER BY p.created_at DESC`,
    [userId]
  );

  for (const project of projects) {
    project.available_capacity = Math.max(0, project.desired_team_size - project.current_members);
  }

  return projects;
}

async function getDashboardData(userId) {
  // 1. User Profile completeness check
  const [userRows] = await pool.execute(
    'SELECT id, name, email, university, department, bio, github_url, portfolio_url FROM users WHERE id = ?',
    [userId]
  );
  const user = userRows[0] || {};
  const [userSkills] = await pool.execute(
    'SELECT COUNT(*) as count FROM user_skills WHERE user_id = ?',
    [userId]
  );

  let completedFields = 0;
  const totalFields = 6;
  if (user.name) completedFields++;
  if (user.university) completedFields++;
  if (user.department) completedFields++;
  if (user.bio) completedFields++;
  if (user.github_url || user.portfolio_url) completedFields++;
  if (userSkills[0].count > 0) completedFields++;
  const profileCompletion = Math.round((completedFields / totalFields) * 100);

  // 2. Created projects
  const [createdProjects] = await pool.execute(
    `SELECT p.id, p.title, p.category, p.status, p.desired_team_size,
            (SELECT COUNT(*) FROM project_members pm WHERE pm.project_id = p.id AND pm.membership_status = 'active') AS current_members,
            (SELECT COUNT(*) FROM join_requests jr WHERE jr.project_id = p.id AND jr.status = 'pending') AS pending_requests_count
     FROM projects p
     WHERE p.owner_id = ?
     ORDER BY p.created_at DESC
     LIMIT 5`,
    [userId]
  );

  // 3. Pending requests received for owned projects
  const [receivedRequests] = await pool.execute(
    `SELECT jr.id, jr.project_id, jr.user_id, jr.message, jr.status, jr.created_at,
            p.title AS project_title,
            u.name AS applicant_name, u.university AS applicant_university, u.department AS applicant_department
     FROM join_requests jr
     JOIN projects p ON jr.project_id = p.id
     JOIN users u ON jr.user_id = u.id
     WHERE p.owner_id = ? AND jr.status = 'pending'
     ORDER BY jr.created_at DESC
     LIMIT 5`,
    [userId]
  );

  // 4. Sent requests submitted by user
  const [sentRequests] = await pool.execute(
    `SELECT jr.id, jr.project_id, jr.status, jr.message, jr.created_at,
            p.title AS project_title, p.category AS project_category,
            u.name AS owner_name
     FROM join_requests jr
     JOIN projects p ON jr.project_id = p.id
     JOIN users u ON p.owner_id = u.id
     WHERE jr.user_id = ?
     ORDER BY jr.created_at DESC
     LIMIT 5`,
    [userId]
  );

  // 5. Active memberships
  const [memberships] = await pool.execute(
    `SELECT p.id, p.title, p.category, p.status, pm.role, pm.joined_at, u.name AS owner_name
     FROM project_members pm
     JOIN projects p ON pm.project_id = p.id
     JOIN users u ON p.owner_id = u.id
     WHERE pm.user_id = ? AND pm.membership_status = 'active' AND p.owner_id != ?
     ORDER BY pm.joined_at DESC
     LIMIT 5`,
    [userId, userId]
  );

  // 6. Recent projects
  const [recentProjects] = await pool.execute(
    `SELECT p.id, p.title, p.summary, p.category, p.status, p.desired_team_size, p.created_at,
            u.name AS owner_name,
            (SELECT COUNT(*) FROM project_members pm WHERE pm.project_id = p.id AND pm.membership_status = 'active') AS current_members
     FROM projects p
     JOIN users u ON p.owner_id = u.id
     WHERE p.status = 'recruiting'
     ORDER BY p.created_at DESC
     LIMIT 4`
  );

  return {
    profileCompletion,
    stats: {
      createdProjectsCount: createdProjects.length,
      activeMembershipsCount: memberships.length,
      pendingReceivedCount: receivedRequests.length,
      sentRequestsCount: sentRequests.length,
    },
    createdProjects,
    receivedRequests,
    sentRequests,
    memberships,
    recentProjects,
  };
}

module.exports = {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  getUserProjects,
  getDashboardData,
};

