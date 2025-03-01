const { StatusCodes } = require('http-status-codes');
const {
  PinoLogger,
  asyncHandler,
  NotFoundError,
  BadRequestError,
} = require('@papdaew/shared');

const NotificationService = require('#notification/services/notification.service.js');

class NotificationController {
  #logger;
  #notificationService;

  constructor() {
    this.#notificationService = new NotificationService();
    this.#logger = new PinoLogger().child({
      service: 'Notification Controller',
    });
  }

  createNotification = asyncHandler(async (req, res) => {
    const { userId, title, message, type, metadata } = req.body;

    if (!userId || !title || !message) {
      this.#logger.error(
        `Missing required fields: userId, title, message: ${JSON.stringify(
          req.body
        )}`
      );
      throw new BadRequestError(
        'Missing required fields: userId, title, message'
      );
    }

    const notification = await this.#notificationService.createNotification({
      userId,
      title,
      message,
      type,
      metadata,
    });

    res.status(StatusCodes.CREATED).json({
      status: 'success',
      message: 'Notification created',
      data: notification,
    });
  });

  getNotifications = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { limit, offset, unreadOnly } = req.query;

    const options = {
      limit: limit ? parseInt(limit, 10) : 10,
      offset: offset ? parseInt(offset, 10) : 0,
      unreadOnly: unreadOnly === 'true',
    };

    const notifications = await this.#notificationService.getUserNotifications(
      userId,
      options
    );

    res.status(StatusCodes.OK).json({
      status: 'success',
      data: notifications,
    });
  });

  getUnreadCount = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    const count = await this.#notificationService.getUnreadCount(userId);

    res.status(StatusCodes.OK).json({
      status: 'success',
      data: { count },
    });
  });

  markAsRead = asyncHandler(async (req, res) => {
    const { userId, notificationId } = req.params;

    const success = await this.#notificationService.markAsRead(
      notificationId,
      userId
    );

    if (!success) {
      throw new NotFoundError(
        'Notification not found or does not belong to user'
      );
    }

    res.status(StatusCodes.OK).json({
      status: 'success',
      message: 'Notification marked as read',
    });
  });

  markAllAsRead = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    const count = await this.#notificationService.markAllAsRead(userId);

    res.status(StatusCodes.OK).json({
      status: 'success',
      message: `${count} notifications marked as read`,
      data: { count },
    });
  });

  deleteNotification = asyncHandler(async (req, res) => {
    const { userId, notificationId } = req.params;

    const success = await this.#notificationService.deleteNotification(
      notificationId,
      userId
    );

    if (!success) {
      this.#logger.error(
        { notificationId, userId },
        `Notification not found or does not belong to user`
      );
      throw new NotFoundError(
        'Notification not found or does not belong to user'
      );
    }

    res.status(StatusCodes.OK).json({
      status: 'success',
      message: 'Notification deleted',
    });
  });
}

module.exports = NotificationController;
