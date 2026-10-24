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

async function getProjectTasks(projectId) {
  const [tasks] = await pool.execute(
    `SELECT 
      pt.id,
      pt.project_id,
      pt.title,
      pt.description,
      pt.status,
      pt.priority,
      pt.assigned_to,
      pt.created_by,
      pt.due_date,
      pt.created_at,
      pt.updated_at,
      u.name AS assignee_name,
      creator.name AS creator_name
     FROM project_tasks pt
     LEFT JOIN users u ON pt.assigned_to = u.id
     JOIN users creator ON pt.created_by = creator.id
     WHERE pt.project_id = ?
     ORDER BY pt.created_at ASC`,
    [projectId]
  );

  return tasks;
}

async function createTask(projectId, userId, taskData) {
  const { title, description = '', priority = 'medium', assigned_to = null, due_date = null } = taskData;

  if (!title || !title.trim()) {
    const error = new Error('Task title is required');
    error.statusCode = 422;
    throw error;
  }

  // 1. Verify user is team member or owner
  const authorized = await isTeamMemberOrOwner(projectId, userId);
  if (!authorized) {
    const error = new Error('Unauthorized. Only project members can create tasks.');
    error.statusCode = 403;
    throw error;
  }

  // 2. Validate priority
  const validPriorities = ['low', 'medium', 'high'];
  const taskPriority = validPriorities.includes(priority) ? priority : 'medium';

  // 3. Insert task
  const [result] = await pool.execute(
    `INSERT INTO project_tasks (project_id, title, description, priority, assigned_to, created_by, due_date)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      projectId,
      title.trim(),
      description ? description.trim() : null,
      taskPriority,
      assigned_to || null,
      userId,
      due_date || null,
    ]
  );

  return {
    id: result.insertId,
    project_id: projectId,
    title: title.trim(),
    description: description ? description.trim() : null,
    status: 'todo',
    priority: taskPriority,
    assigned_to: assigned_to || null,
    created_by: userId,
    due_date: due_date || null,
    created_at: new Date().toISOString(),
  };
}

async function updateTask(taskId, userId, updateData) {
  // 1. Fetch task and check project membership
  const [tasks] = await pool.execute('SELECT * FROM project_tasks WHERE id = ?', [taskId]);
  if (tasks.length === 0) {
    const error = new Error('Task not found');
    error.statusCode = 404;
    throw error;
  }
  const task = tasks[0];

  const authorized = await isTeamMemberOrOwner(task.project_id, userId);
  if (!authorized) {
    const error = new Error('Unauthorized. Only project members can update tasks.');
    error.statusCode = 403;
    throw error;
  }

  // 2. Build update parameters
  const updates = [];
  const params = [];

  if (updateData.status !== undefined) {
    const validStatuses = ['todo', 'in_progress', 'completed'];
    if (validStatuses.includes(updateData.status)) {
      updates.push('status = ?');
      params.push(updateData.status);
    }
  }

  if (updateData.title !== undefined && updateData.title.trim()) {
    updates.push('title = ?');
    params.push(updateData.title.trim());
  }

  if (updateData.description !== undefined) {
    updates.push('description = ?');
    params.push(updateData.description ? updateData.description.trim() : null);
  }

  if (updateData.priority !== undefined) {
    const validPriorities = ['low', 'medium', 'high'];
    if (validPriorities.includes(updateData.priority)) {
      updates.push('priority = ?');
      params.push(updateData.priority);
    }
  }

  if (updateData.assigned_to !== undefined) {
    updates.push('assigned_to = ?');
    params.push(updateData.assigned_to || null);
  }

  if (updateData.due_date !== undefined) {
    updates.push('due_date = ?');
    params.push(updateData.due_date || null);
  }

  if (updates.length === 0) {
    return task;
  }

  params.push(taskId);
  await pool.execute(`UPDATE project_tasks SET ${updates.join(', ')} WHERE id = ?`, params);

  const [updated] = await pool.execute(
    `SELECT pt.*, u.name AS assignee_name, creator.name AS creator_name
     FROM project_tasks pt
     LEFT JOIN users u ON pt.assigned_to = u.id
     JOIN users creator ON pt.created_by = creator.id
     WHERE pt.id = ?`,
    [taskId]
  );

  return updated[0];
}

async function deleteTask(taskId, userId) {
  const [tasks] = await pool.execute('SELECT * FROM project_tasks WHERE id = ?', [taskId]);
  if (tasks.length === 0) {
    const error = new Error('Task not found');
    error.statusCode = 404;
    throw error;
  }
  const task = tasks[0];

  const authorized = await isTeamMemberOrOwner(task.project_id, userId);
  if (!authorized) {
    const error = new Error('Unauthorized. Only project members can delete tasks.');
    error.statusCode = 403;
    throw error;
  }

  await pool.execute('DELETE FROM project_tasks WHERE id = ?', [taskId]);
  return { message: 'Task deleted successfully' };
}

module.exports = {
  getProjectTasks,
  createTask,
  updateTask,
  deleteTask,
};
