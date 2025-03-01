const { Router } = require('express');

const NotificationController = require('#notification/controllers/notification.controller.js');

class NotificationRoutes {
  #router;
  #notificationController;

  constructor() {
    this.#router = Router();
    this.#notificationController = new NotificationController();
  }

  setup() {
    this.#router.post('/', this.#notificationController.createNotification);
    this.#router.get(
      '/users/:userId',
      this.#notificationController.getNotifications
    );
    this.#router.get(
      '/users/:userId/unread/count',
      this.#notificationController.getUnreadCount
    );
    this.#router.put(
      '/users/:userId/read/all',
      this.#notificationController.markAllAsRead
    );
    this.#router.put(
      '/users/:userId/:notificationId/read',
      this.#notificationController.markAsRead
    );
    this.#router.delete(
      '/users/:userId/:notificationId',
      this.#notificationController.deleteNotification
    );
    return this.#router;
  }
}

module.exports = NotificationRoutes;
