const notificationService = require('../services/notificationService');
const { successResponse } = require('../utils/apiResponse');

async function getNotifications(req, res, next) {
  try {
    const unreadOnly = req.query.unreadOnly === 'true';
    const limit = parseInt(req.query.limit, 10) || 20;
    const offset = parseInt(req.query.offset, 10) || 0;

    const notifications = await notificationService.getUserNotifications(req.user.id, {
      limit,
      offset,
      unreadOnly,
    });
    const unreadCount = await notificationService.getUnreadCount(req.user.id);

    return successResponse(res, 'Notifications retrieved successfully', {
      notifications,
      unread_count: unreadCount,
    });
  } catch (err) {
    next(err);
  }
}

async function getUnreadCount(req, res, next) {
  try {
    const count = await notificationService.getUnreadCount(req.user.id);
    return successResponse(res, 'Unread count retrieved successfully', { unread_count: count });
  } catch (err) {
    next(err);
  }
}

async function markAsRead(req, res, next) {
  try {
    const notificationId = parseInt(req.params.id, 10);
    await notificationService.markAsRead(notificationId, req.user.id);
    return successResponse(res, 'Notification marked as read');
  } catch (err) {
    next(err);
  }
}

async function markAllAsRead(req, res, next) {
  try {
    const affected = await notificationService.markAllAsRead(req.user.id);
    return successResponse(res, 'All notifications marked as read', { updated_count: affected });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
};
