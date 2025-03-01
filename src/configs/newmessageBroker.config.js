const amqp = require('amqplib');
const { PinoLogger } = require('@papdaew/shared');
const EmailService = require('#notification/services/email.service.js');
const Config = require('#notification/configs/config.js');

class Connection {
  static #instance;
  #connection;
  #channel;
  #logger;
  #config;

  constructor() {
    if (Connection.#instance) {
      return Connection.#instance;
    }
    this.#config = new Config();
    this.#logger = new PinoLogger({
        name: 'MessageBroker',
        level: 'info',
        serviceVersion: process.env.SERVICE_VERSION || '1.0.0',
        environment: process.env.NODE_ENV || 'development'
      }).child({
        service: 'RabbitMQ Connection' 
      });
    Connection.#instance = this;
  }

  connect = async () => { 
    try {
      this.#connection = await amqp.connect(this.#config.RABBITMQ_URL);
      this.#channel = await this.#connection.createChannel();
      this.#logger.info('Successfully connected to RabbitMQ');
    } catch (error) {
      this.#logger.error('Failed to connect to RabbitMQ', error);
      throw error;
    }
  }

  disconnect = async () => {
    await this.#channel?.close();
    await this.#connection?.close();
  }

  getChannel = () => {
    return this.#channel;
  }

  getLogger = () => {
    return this.#logger;
  }

}

class Producer {
  #channel;
  #logger;

  constructor(channel) {
    this.#channel = channel;
    this.#logger = new PinoLogger({
        name: 'MessageBroker',
        level: 'info',
        serviceVersion: process.env.SERVICE_VERSION || '1.0.0',
        environment: process.env.NODE_ENV || 'development'
      }).child({
        service: 'RabbitMQ Producer' 
      });
  }

  publishDirect = async (queue, message, logMessage) => {
    try {
      await this.#channel.assertQueue(queue, { durable: true });
      await this.#channel.sendToQueue(queue, Buffer.from(message), { persistent: true });
      this.#logger.info(logMessage);
    } catch (error) {
      this.#logger.error(`Failed to publish direct message to queue: ${queue}`, error);
      throw error;
    }
  }

  publishFanout = async (exchange, message, logMessage) => {
    try {
      await this.#channel.assertExchange(exchange, 'fanout', { durable: true });
      await this.#channel.publish(exchange, '', Buffer.from(JSON.stringify(message)));
      this.#logger.info(logMessage);
    } catch (error) {
      this.#logger.error(`Failed to publish fanout message to exchange: ${exchange}`, error);
      throw error;
    }
  }
}

class Consumer {
  #channel;
  #logger;
  #emailService;

  constructor(channel) {
    this.#channel = channel;
    this.#emailService = new EmailService();
    this.#logger = new PinoLogger({
        name: 'MessageBroker',
        level: 'info',
        serviceVersion: process.env.SERVICE_VERSION || '1.0.0',
        environment: process.env.NODE_ENV || 'development'
      }).child({
        service: 'RabbitMQ Consumer' 
      });
  }

  setupEmailConsumer = async () => {
    const queue = 'email_notifications';
    try {
      await this.#channel.assertQueue(queue, { durable: true });
      this.#logger.info(`Starting to consume messages from queue: ${queue}`);

      await this.#channel.consume(queue, async (message) => {
        if (!message) return;
        try {
          const parsedMessage = JSON.parse(message.content.toString());
          await this.#handleEmailMessage(parsedMessage);
          this.#channel.ack(message);
        } catch (error) {
          this.#logger.error(`Error processing message: ${error.message}`);
          const requeue = !error.isPermanent;
          this.#channel.reject(message, requeue);
        }
      });
    } catch (error) {
      this.#logger.error('Failed to setup email consumer', error);
      throw error;
    }
  }

  #handleEmailMessage = async message => {
    const { type, recipient, data } = message;
    if (!type || !recipient || !data) {
      const error = new Error('Invalid message format');
      error.isPermanent = true;
      throw error;
    }

    switch (type) {
      case 'WELCOME':
        this.#logger.info(`Processing welcome email for ${recipient}`);
        await this.#emailService.sendWelcomeEmail(recipient, data);
        break;
      case 'VERIFICATION':
        this.#logger.info(`Processing verification email for ${recipient}`);
        await this.#emailService.sendVerificationEmail(recipient, data);
        break;
      default:
        const error = new Error(`Unknown email type: ${type}`);
        error.isPermanent = true;
        throw error;
    }
  }
}

class MessageBroker {
  static #instance;
  #connection;
  #producer;
  #consumer;

  constructor() {
    if (MessageBroker.#instance) {
      return MessageBroker.#instance;
    }

    this.#connection = new Connection();
    MessageBroker.#instance = this;
  }

  connect = async () => {
    await this.#connection.connect();
    const channel = this.#connection.getChannel();
    this.#producer = new Producer(channel);
    this.#consumer = new Consumer(channel);
    await this.#consumer.setupEmailConsumer();
  }

  disconnect = async () => {
    await this.#connection.disconnect();
  }

  publishDirect = async (queue, message, logMessage) => {
    return this.#producer.publishDirect(queue, message, logMessage);
  }

  publishFanout = async (exchange, message, logMessage) => {
    return this.#producer.publishFanout(exchange, message, logMessage);
  }
}

module.exports = MessageBroker;