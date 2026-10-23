const { pool } = require('../config/db');
const { createNotification } = require('./notificationService');

async function createJoinRequest(projectId, userId, message = '') {
  // 1. Get project details
  const [projects] = await pool.execute(
    'SELECT id, owner_id, title, desired_team_size, status FROM projects WHERE id = ?',
    [projectId]
  );

  if (projects.length === 0) {
    const error = new Error('Project not found');
    error.statusCode = 404;
    throw error;
  }

  const project = projects[0];

  // Rule 4: Prevent owners joining their own projects through join requests
  if (project.owner_id === userId) {
    const error = new Error('You cannot submit a join request to your own project');
    error.statusCode = 400;
    throw error;
  }

  // Prevent requests on completed or cancelled projects
  if (project.status === 'completed' || project.status === 'cancelled') {
    const error = new Error(`Cannot join a project that is ${project.status}`);
    error.statusCode = 400;
    throw error;
  }

  // Check if user is already an active member
  const [members] = await pool.execute(
    `SELECT id FROM project_members 
     WHERE project_id = ? AND user_id = ? AND membership_status = 'active'`,
    [projectId, userId]
  );

  if (members.length > 0) {
    const error = new Error('You are already an active member of this project');
    error.statusCode = 400;
    throw error;
  }

  // Rule 3: Prevent duplicate pending join requests
  const [pendingRequests] = await pool.execute(
    `SELECT id FROM join_requests 
     WHERE project_id = ? AND user_id = ? AND status = 'pending'`,
    [projectId, userId]
  );

  if (pendingRequests.length > 0) {
    const error = new Error('You already have a pending join request for this project');
    error.statusCode = 409;
    throw error;
  }

  // Rule 5: Check project capacity
  const [memberCountResult] = await pool.execute(
    `SELECT COUNT(*) AS active_count FROM project_members 
     WHERE project_id = ? AND membership_status = 'active'`,
    [projectId]
  );

  const currentMembers = memberCountResult[0].active_count;
  if (currentMembers >= project.desired_team_size) {
    const error = new Error('This project has reached its maximum team capacity');
    error.statusCode = 400;
    throw error;
  }

  // Fetch applicant name for notification
  const [applicant] = await pool.execute(
    'SELECT name FROM users WHERE id = ?',
    [userId]
  );
  const applicantName = applicant.length > 0 ? applicant[0].name : 'A student';

  // Insert request
  const [result] = await pool.execute(
    `INSERT INTO join_requests (project_id, user_id, message, status)
     VALUES (?, ?, ?, 'pending')`,
    [projectId, userId, message ? message.trim() : null]
  );

  const requestId = result.insertId;

  // Create notification for project owner
  await createNotification({
    userId: project.owner_id,
    type: 'join_request_received',
    title: 'New Join Request',
    message: `${applicantName} requested to join "${project.title}".`,
    relatedProjectId: projectId,
    relatedRequestId: requestId,
  });

  return {
    id: requestId,
    project_id: projectId,
    user_id: userId,
    status: 'pending',
    message: message ? message.trim() : null,
  };
}

async function getSentRequests(userId) {
  const [rows] = await pool.execute(
    `SELECT 
      jr.id,
      jr.project_id,
      jr.message,
      jr.status,
      jr.created_at,
      jr.updated_at,
      p.title AS project_title,
      p.category AS project_category,
      p.status AS project_status,
      u.name AS owner_name,
      u.email AS owner_email
     FROM join_requests jr
     JOIN projects p ON jr.project_id = p.id
     JOIN users u ON p.owner_id = u.id
     WHERE jr.user_id = ?
     ORDER BY jr.created_at DESC`,
    [userId]
  );

  return rows;
}

async function getReceivedRequests(userId) {
  const [rows] = await pool.execute(
    `SELECT 
      jr.id,
      jr.project_id,
      jr.user_id AS applicant_id,
      jr.message,
      jr.status,
      jr.created_at,
      jr.updated_at,
      p.title AS project_title,
      p.category AS project_category,
      p.desired_team_size,
      (SELECT COUNT(*) FROM project_members pm WHERE pm.project_id = p.id AND pm.membership_status = 'active') AS current_members,
      u.name AS applicant_name,
      u.email AS applicant_email,
      u.university AS applicant_university,
      u.department AS applicant_department,
      u.github_url AS applicant_github,
      u.portfolio_url AS applicant_portfolio
     FROM join_requests jr
     JOIN projects p ON jr.project_id = p.id
     JOIN users u ON jr.user_id = u.id
     WHERE p.owner_id = ?
     ORDER BY jr.created_at DESC`,
    [userId]
  );

  // Attach applicant skills for context
  if (rows.length > 0) {
    const applicantIds = [...new Set(rows.map((r) => r.applicant_id))];
    const placeholders = applicantIds.map(() => '?').join(',');
    const [skillRows] = await pool.execute(
      `SELECT us.user_id, s.name, us.proficiency_level
       FROM user_skills us
       JOIN skills s ON us.skill_id = s.id
       WHERE us.user_id IN (${placeholders})`,
      applicantIds
    );

    const skillsByUser = {};
    for (const s of skillRows) {
      if (!skillsByUser[s.user_id]) skillsByUser[s.user_id] = [];
      skillsByUser[s.user_id].push({ name: s.name, proficiency_level: s.proficiency_level });
    }

    for (const r of rows) {
      r.applicant_skills = skillsByUser[r.applicant_id] || [];
    }
  }

  return rows;
}

async function updateRequestStatus(requestId, userId, newStatus) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // 1. Fetch request with project info and lock row
    const [requests] = await connection.execute(
      `SELECT jr.id, jr.project_id, jr.user_id AS applicant_id, jr.status,
              p.owner_id, p.title AS project_title, p.desired_team_size
       FROM join_requests jr
       JOIN projects p ON jr.project_id = p.id
       WHERE jr.id = ? FOR UPDATE`,
      [requestId]
    );

    if (requests.length === 0) {
      const error = new Error('Join request not found');
      error.statusCode = 404;
      throw error;
    }

    const request = requests[0];

    // If withdrawing, only the applicant can withdraw
    if (newStatus === 'withdrawn') {
      if (request.applicant_id !== userId) {
        const error = new Error('Unauthorized. Only the applicant can withdraw this request.');
        error.statusCode = 403;
        throw error;
      }
      if (request.status !== 'pending') {
        const error = new Error(`Cannot withdraw request that is already ${request.status}`);
        error.statusCode = 400;
        throw error;
      }

      await connection.execute(
        'UPDATE join_requests SET status = "withdrawn" WHERE id = ?',
        [requestId]
      );

      await connection.commit();
      return { id: requestId, status: 'withdrawn' };
    }

    // Otherwise, must be accepted or rejected by project owner
    if (request.owner_id !== userId) {
      const error = new Error('Unauthorized. Only the project owner can update this join request.');
      error.statusCode = 403;
      throw error;
    }

    if (request.status !== 'pending') {
      const error = new Error(`Request has already been ${request.status}`);
      error.statusCode = 400;
      throw error;
    }

    if (newStatus === 'rejected') {
      await connection.execute(
        'UPDATE join_requests SET status = "rejected" WHERE id = ?',
        [requestId]
      );

      await connection.commit();

      // Notify applicant
      await createNotification({
        userId: request.applicant_id,
        type: 'join_request_rejected',
        title: 'Request Not Accepted',
        message: `Your request to join "${request.project_title}" was not accepted.`,
        relatedProjectId: request.project_id,
        relatedRequestId: requestId,
      });

      return { id: requestId, status: 'rejected' };
    }

    if (newStatus === 'accepted') {
      // Rule 7 & 8: Check available capacity with lock
      const [countResult] = await connection.execute(
        `SELECT COUNT(*) AS active_count FROM project_members 
         WHERE project_id = ? AND membership_status = 'active' FOR UPDATE`,
        [request.project_id]
      );

      const activeCount = countResult[0].active_count;
      if (activeCount >= request.desired_team_size) {
        const error = new Error('Cannot accept request: project has already reached maximum team capacity');
        error.statusCode = 400;
        throw error;
      }

      // Update request status
      await connection.execute(
        'UPDATE join_requests SET status = "accepted" WHERE id = ?',
        [requestId]
      );

      // Rule 14: Insert or activate project membership
      await connection.execute(
        `INSERT INTO project_members (project_id, user_id, role, membership_status)
         VALUES (?, ?, 'Member', 'active')
         ON DUPLICATE KEY UPDATE membership_status = 'active', role = 'Member'`,
        [request.project_id, request.applicant_id]
      );

      await connection.commit();

      // Notify applicant
      await createNotification({
        userId: request.applicant_id,
        type: 'join_request_accepted',
        title: 'Welcome to the Team!',
        message: `Your request to join "${request.project_title}" was accepted! You are now a team member.`,
        relatedProjectId: request.project_id,
        relatedRequestId: requestId,
      });

      return { id: requestId, status: 'accepted' };
    }

    const error = new Error('Invalid status specified');
    error.statusCode = 400;
    throw error;
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

async function deleteRequest(requestId, userId) {
  const [rows] = await pool.execute(
    'SELECT user_id, status FROM join_requests WHERE id = ?',
    [requestId]
  );

  if (rows.length === 0) {
    const error = new Error('Join request not found');
    error.statusCode = 404;
    throw error;
  }

  if (rows[0].user_id !== userId) {
    const error = new Error('Unauthorized. You can only delete your own join request.');
    error.statusCode = 403;
    throw error;
  }

  await pool.execute('DELETE FROM join_requests WHERE id = ?', [requestId]);
  return true;
}

module.exports = {
  createJoinRequest,
  getSentRequests,
  getReceivedRequests,
  updateRequestStatus,
  deleteRequest,
};
