const { PinoLogger } = require('@papdaew/shared');

const NotificationService = require('#notification/services/notification.service.js');
const EmailService = require('#notification/services/email.service.js');

class NotificationEventHandler {
  #logger;
  #emailService;
  #notificationService;

  constructor() {
    this.#emailService = new EmailService();
    this.#notificationService = new NotificationService();
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
        this.#logger.error(event, 'Invalid email notification data');
        return;
      }

      switch (data.type) {
        case 'WELCOME':
          await this.#emailService.sendWelcomeEmail(data.recipient, data.data);
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
      this.#logger.error(error, 'Error handling email notification event');
      throw error;
    }
  };

  handleQueueEvent = async event => {
    try {
      this.#logger.info(
        `Received queue event: ${event.type || 'unknown type'}`
      );

      const { type, data } = event;

      switch (type) {
        case 'QUEUE_CREATED':
          await this.#notificationService.createNotification({
            userId: data.vendorId,
            title: 'New Queue Created',
            message: `Your queue "${data.name}" has been created successfully.`,
            type: 'info',
            metadata: {
              queueId: data.id,
              eventType: 'queue.created',
            },
          });
          break;

        case 'QUEUE_UPDATED':
          await this.#notificationService.createNotification({
            userId: data.vendorId,
            title: 'Queue Updated',
            message: `Your queue "${data.name}" has been updated.`,
            type: 'info',
            metadata: {
              queueId: data.id,
              eventType: 'queue.updated',
            },
          });
          break;

        case 'USER_ENQUEUED':
          // Notify the vendor
          await this.#notificationService.createNotification({
            userId: data.vendorId,
            title: 'New Customer in Queue',
            message: `A new customer has joined your queue. Current waiting count: ${data.waitingCount + 1}`,
            type: 'info',
            metadata: {
              queueId: data.queueId,
              userId: data.userId,
              eventType: 'queue.user.enqueued',
            },
          });

          // Notify the user who joined
          await this.#notificationService.createNotification({
            userId: data.userId,
            title: 'Successfully Joined Queue',
            message: `You have successfully joined the queue. Your number is ${data.number}. Estimated wait time: ${Math.round(data.estimatedWaitTime / 60)} minutes.`,
            type: 'success',
            metadata: {
              queueId: data.queueId,
              number: data.number,
              eventType: 'queue.user.enqueued',
            },
          });
          break;

        case 'USER_DEQUEUED':
          await this.#notificationService.createNotification({
            userId: data.userId,
            title: 'Your Turn Has Arrived',
            message: `It's your turn! Please proceed to the service counter.`,
            type: 'success',
            metadata: {
              queueId: data.queueId,
              number: data.number,
              eventType: 'queue.user.dequeued',
            },
          });
          break;

        case 'USER_EXITED':
          // Notify vendor that user left the queue
          await this.#notificationService.createNotification({
            userId: data.vendorId,
            title: 'Customer Left Queue',
            message: `A customer with number ${data.number} has left your queue.`,
            type: 'info',
            metadata: {
              queueId: data.queueId,
              number: data.number,
              eventType: 'queue.user.exited',
            },
          });
          break;

        default:
          this.#logger.info(`Unhandled queue event type: ${type}`);
      }

      this.#logger.info(`Successfully processed queue event: ${type}`);
    } catch (error) {
      this.#logger.error(error, 'Error handling queue event');
      throw error;
    }
  };
}

module.exports = NotificationEventHandler;
