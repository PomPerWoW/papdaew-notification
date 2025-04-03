const { PinoLogger } = require('@papdaew/shared');

const NotificationEventHandler = require('#notification/events/handlers/notification.event.handler.js');
const MessageBroker = require('#notification/configs/messageBroker.config.js');

class EventSubscriber {
  #logger;
  #messageBroker;
  #notificationEventHandler;

  constructor() {
    this.#messageBroker = new MessageBroker();
    this.#notificationEventHandler = new NotificationEventHandler();
    this.#logger = new PinoLogger().child({
      service: 'Event Subscriber',
    });
  }

  setupSubscriptions = async () => {
    try {
      // Subscribe to email notifications
      await this.#messageBroker.subscribeDirect(
        'email_notifications',
        this.#notificationEventHandler.handleEmailNotification
      );

      // Subscribe to queue events
      await this.#messageBroker.subscribeDirect(
        'queue.created',
        this.#notificationEventHandler.handleQueueEvent
      );

      await this.#messageBroker.subscribeDirect(
        'queue.updated',
        this.#notificationEventHandler.handleQueueEvent
      );

      await this.#messageBroker.subscribeDirect(
        'queue.user.enqueued',
        this.#notificationEventHandler.handleQueueEvent
      );

      await this.#messageBroker.subscribeDirect(
        'queue.user.dequeued',
        this.#notificationEventHandler.handleQueueEvent
      );

      await this.#messageBroker.subscribeDirect(
        'queue.user.exited',
        this.#notificationEventHandler.handleQueueEvent
      );

      this.#logger.info('Event subscriptions set up successfully');
    } catch (error) {
      this.#logger.error(error, 'Failed to set up event subscriptions');
      throw error;
    }
  };
}

module.exports = EventSubscriber;
