const { PinoLogger } = require('@papdaew/shared');

const SocketService = require('#notification/services/socket.service.js');
const Database = require('#notification/configs/database.config.js');

class NotificationService {
  #logger;
  #database;
  #socketService;

  constructor() {
    this.#database = new Database();
    this.#socketService = new SocketService();
    this.#logger = new PinoLogger().child({
      service: 'Notification Service',
    });
  }

  async createNotification(data) {
    try {
      const notification = await this.#database.prisma.notification.create({
        data: {
          userId: data.userId,
          title: data.title,
          message: data.message,
          type: data.type || 'info',
          metadata: data.metadata || {},
        },
      });

      this.#logger.info(
        { notificationId: notification.id, userId: data.userId },
        'Notification created'
      );

      // Send real-time notification to the user
      this.#socketService.sendNotification(data.userId, notification);

      // Update unread count
      const unreadCount = await this.getUnreadCount(data.userId);
      this.#socketService.updateUnreadCount(data.userId, unreadCount);

      return notification;
    } catch (error) {
      this.#logger.error(error, 'Failed to create notification');
      throw error;
    }
  }

  async getUserNotifications(userId, options = {}) {
    try {
      const { limit = 10, offset = 0, unreadOnly = false } = options;

      const where = { userId };
      if (unreadOnly) {
        where.isRead = false;
      }

      const notifications = await this.#database.prisma.notification.findMany({
        where,
        orderBy: {
          createdAt: 'desc',
        },
        take: limit,
        skip: offset,
      });

      this.#logger.info(
        { userId, count: notifications.length },
        'Retrieved user notifications'
      );

      return notifications;
    } catch (error) {
      this.#logger.error(error, 'Failed to get user notifications');
      throw error;
    }
  }

  async getUnreadCount(userId) {
    try {
      const count = await this.#database.prisma.notification.count({
        where: {
          userId,
          isRead: false,
        },
      });

      this.#logger.info(
        { userId, count },
        'Retrieved unread notification count'
      );

      return count;
    } catch (error) {
      this.#logger.error(error, 'Failed to get unread notification count');
      throw error;
    }
  }

  async markAsRead(notificationId, userId) {
    try {
      const notification = await this.#database.prisma.notification.findUnique({
        where: {
          id: notificationId,
          userId,
        },
      });

      if (!notification) {
        this.#logger.error(
          { notificationId, userId },
          'Notification not found or does not belong to user'
        );
        return false;
      }

      if (notification.isRead) {
        return true; // Already read
      }

      await this.#database.prisma.notification.update({
        where: { id: notificationId },
        data: { isRead: true },
      });

      this.#logger.info(
        { notificationId, userId },
        'Notification marked as read'
      );

      // Update unread count
      const unreadCount = await this.getUnreadCount(userId);
      this.#socketService.updateUnreadCount(userId, unreadCount);

      return true;
    } catch (error) {
      this.#logger.error(error, 'Failed to mark notification as read');
      throw error;
    }
  }

  async markAllAsRead(userId) {
    try {
      const result = await this.#database.prisma.notification.updateMany({
        where: {
          userId,
          isRead: false,
        },
        data: {
          isRead: true,
        },
      });

      const { count } = result;

      this.#logger.info({ userId, count }, 'All notifications marked as read');

      // Update unread count (should be 0 now)
      this.#socketService.updateUnreadCount(userId, 0);

      return count;
    } catch (error) {
      this.#logger.error(error, 'Failed to mark all notifications as read');
      throw error;
    }
  }

  async deleteNotification(notificationId, userId) {
    try {
      const result = await this.#database.prisma.notification.deleteMany({
        where: {
          id: notificationId,
          userId,
        },
      });

      const success = result.count > 0;

      if (success) {
        this.#logger.info({ notificationId, userId }, 'Notification deleted');

        // Update unread count
        const unreadCount = await this.getUnreadCount(userId);
        this.#socketService.updateUnreadCount(userId, unreadCount);
      }

      return success;
    } catch (error) {
      this.#logger.error(error, 'Failed to delete notification');
      throw error;
    }
  }
}

module.exports = NotificationService;
