const { Server } = require('socket.io');
const { PinoLogger } = require('@papdaew/shared');

class SocketService {
  #io;
  #logger;
  static #instance;

  constructor() {
    if (SocketService.#instance) {
      return SocketService.#instance;
    }

    this.#logger = new PinoLogger().child({
      service: 'Socket Service',
    });

    SocketService.#instance = this;
  }

  initialize(server) {
    this.#io = new Server(server, {
      cors: {
        credentials: true,
      },
    });

    this.#setupSocketEvents();
    this.#logger.info('Socket.IO initialized');
  }

  #setupSocketEvents() {
    this.#io.on('connection', socket => {
      this.#logger.info({ socketId: socket.id }, 'Client connected');

      // Join user-specific room for targeted notifications
      socket.on('join', userId => {
        if (!userId) {
          return;
        }

        socket.join(`user:${userId}`);
        this.#logger.info({ socketId: socket.id, userId }, 'User joined room');
      });

      socket.on('disconnect', () => {
        this.#logger.info({ socketId: socket.id }, 'Client disconnected');
      });
    });
  }

  sendNotification(userId, notification) {
    if (!this.#io) {
      this.#logger.warn('Socket.IO not initialized');
      return;
    }

    this.#io.to(`user:${userId}`).emit('notification', notification);
    this.#logger.info({ userId }, 'Notification sent to user');
  }

  broadcastNotification(notification) {
    if (!this.#io) {
      this.#logger.warn('Socket.IO not initialized');
      return;
    }

    this.#io.emit('notification', notification);
    this.#logger.info('Notification broadcasted to all users');
  }

  updateUnreadCount(userId, count) {
    if (!this.#io) {
      this.#logger.warn('Socket.IO not initialized');
      return;
    }

    this.#io.to(`user:${userId}`).emit('unread_count', { count });
    this.#logger.info({ userId, count }, 'Unread count updated for user');
  }

  get io() {
    return this.#io;
  }
}

module.exports = SocketService;
