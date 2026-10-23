const { pool } = require('../config/db');

async function createNotification({ userId, type, title, message, relatedProjectId = null, relatedRequestId = null }) {
  try {
    const [result] = await pool.execute(
      `INSERT INTO notifications (user_id, type, title, message, related_project_id, related_request_id)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, type, title, message, relatedProjectId, relatedRequestId]
    );
    return result.insertId;
  } catch (err) {
    console.error('Failed to create notification:', err.message);
    // Notifications should not break main transactions if optional
    return null;
  }
}

async function getUserNotifications(userId, { limit = 20, offset = 0, unreadOnly = false } = {}) {
  let query = `
    SELECT id, user_id, type, title, message, related_project_id, related_request_id, is_read, created_at
    FROM notifications
    WHERE user_id = ?
  `;
  const params = [userId];

  if (unreadOnly) {
    query += ' AND is_read = FALSE';
  }

  query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  params.push(parseInt(limit, 10), parseInt(offset, 10));

  const [rows] = await pool.execute(query, params);
  return rows;
}

async function getUnreadCount(userId) {
  const [rows] = await pool.execute(
    'SELECT COUNT(*) AS unread_count FROM notifications WHERE user_id = ? AND is_read = FALSE',
    [userId]
  );
  return rows[0].unread_count;
}

async function markAsRead(notificationId, userId) {
  const [result] = await pool.execute(
    'UPDATE notifications SET is_read = TRUE WHERE id = ? AND user_id = ?',
    [notificationId, userId]
  );
  return result.affectedRows > 0;
}

async function markAllAsRead(userId) {
  const [result] = await pool.execute(
    'UPDATE notifications SET is_read = TRUE WHERE user_id = ? AND is_read = FALSE',
    [userId]
  );
  return result.affectedRows;
}

module.exports = {
  createNotification,
  getUserNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
};
