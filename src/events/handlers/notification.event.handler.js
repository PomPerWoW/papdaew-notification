const { PinoLogger } = require('@papdaew/shared');

const EmailService = require('#notification/services/email.service.js');

class NotificationEventHandler {
  #logger;
  #emailService;

  constructor() {
    this.#emailService = new EmailService();
    this.#logger = new PinoLogger().child({
      service: 'Notification Event Handler',
    });
  }

  handleEmailNotification = async event => {
    try {
      this.#logger.info(
        `Received email notification event: ${event.type || 'unknown type'}`
      );

      const data = event.data || event;

      if (!data.recipient || !data.type) {
        this.#logger.error('Invalid email notification data', { event });
        return;
      }

      switch (data.type) {
        case 'WELCOME':
          await this.#emailService.sendWelcomeEmail(
            data.recipient,
            data.data.username
          );
          break;

        case 'VERIFICATION':
          await this.#emailService.sendVerificationEmail(
            data.recipient,
            data.data
          );
          break;

        case 'RESET_PASSWORD':
          await this.#emailService.sendPasswordResetEmail(
            data.recipient,
            data.data
          );
          break;

        default:
          this.#logger.info(`Unhandled email notification type: ${data.type}`);
          throw new Error(`Unhandled email notification type: ${data.type}`);
      }

      this.#logger.info(
        `Successfully processed email notification for: ${data.recipient}`
      );
    } catch (error) {
      this.#logger.error('Error handling email notification event', error);
      throw error;
    }
  };
}

module.exports = NotificationEventHandler;
