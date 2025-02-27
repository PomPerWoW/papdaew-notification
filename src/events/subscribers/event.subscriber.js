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
      await this.#messageBroker.subscribeDirect(
        'email_notifications',
        this.#notificationEventHandler.handleEmailNotification
      );

      this.#logger.info('Event subscriptions set up successfully');
    } catch (error) {
      this.#logger.error(error, 'Failed to set up event subscriptions');
      throw error;
    }
  };
}

module.exports = EventSubscriber;
