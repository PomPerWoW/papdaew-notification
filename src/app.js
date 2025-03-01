const { PinoLogger } = require('@papdaew/shared');

const NotificationServer = require('#notification/server.js');
const EventSubscriber = require('#notification/events/subscribers/event.subscriber.js');
const MessageBroker = require('#notification/configs/messageBroker.config.js');
const Config = require('#notification/configs/config.js');

class Application {
  constructor() {
    this.config = new Config();
    this.appLogger = new PinoLogger({
      name: 'Notification Application',
      level: this.config.LOG_LEVEL,
      serviceVersion: this.config.SERVICE_VERSION,
      environment: this.config.NODE_ENV,
    });
    this.server = new NotificationServer();
    this.messageBroker = new MessageBroker();
    this.eventSubscriber = new EventSubscriber();
  }

  initialize = async () => {
    this.appLogger.info('Initializing Notification Application');
    this.setupUncaughtException();
    await this.messageBroker.connect();
    await this.eventSubscriber.setupSubscriptions();
    this.server.start();
    this.setupUnhandledRejection();
    this.setupShutdown();
  };

  setupUncaughtException = () => {
    process.once('uncaughtException', error => {
      this.appLogger.error(error, `Uncaught Exception: ${error.name}`);
      process.exit(1);
    });
  };

  setupUnhandledRejection = () => {
    process.once('unhandledRejection', error => {
      this.appLogger.error(error, `Unhandled Rejection: ${error.name}`);
      this.server.close();
      process.exit(1);
    });
  };

  setupShutdown = () => {
    const shutdown = async () => {
      try {
        await this.messageBroker.disconnect();
        await this.server.close();
        process.exit(0);
      } catch (error) {
        this.appLogger.error(error, `Error during shutdown: ${error.name}`);
        process.exit(1);
      }
    };

    process.once('SIGTERM', shutdown);
    process.once('SIGINT', shutdown);
  };
}

const application = new Application();

application.initialize().catch(() => {
  application.appLogger.error('Error during application initialization');
  process.exit(1);
});
