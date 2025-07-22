const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Create a notification
const createNotification = async (userId, type, title, message, data = null) => {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        data,
      },
    });

    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

// Get user notifications
const getUserNotifications = async (userId, limit = 10, offset = 0) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });

    return notifications;
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }
};

// Mark notification as read
const markNotificationAsRead = async (notificationId, userId) => {
  try {
    const notification = await prisma.notification.update({
      where: {
        id: notificationId,
        userId, 
      },
      data: {
        isRead: true,
      },
    });

    return notification;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

// Mark all notifications as read for a user
const markAllNotificationsAsRead = async (userId) => {
  try {
    const result = await prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });

    return result;
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
};

// Delete notification
const deleteNotification = async (notificationId, userId) => {
  try {
    const notification = await prisma.notification.delete({
      where: {
        id: notificationId,
        userId, // Ensure user owns this notification
      },
    });

    return notification;
  } catch (error) {
    console.error('Error deleting notification:', error);
    throw error;
  }
};

// Get unread notification count
const getUnreadNotificationCount = async (userId) => {
  try {
    const count = await prisma.notification.count({
      where: {
        userId,
        isRead: false,
      },
    });

    return count;
  } catch (error) {
    console.error('Error getting unread notification count:', error);
    throw error;
  }
};

module.exports = {
  createNotification,
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  getUnreadNotificationCount,
};
