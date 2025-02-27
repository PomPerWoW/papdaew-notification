const path = require('path');

const nodemailer = require('nodemailer');
const ejs = require('ejs');
const { PinoLogger } = require('@papdaew/shared');

const Config = require('#notification/configs/config.js');

class EmailService {
  #logger;
  #config;
  #transporter;

  constructor() {
    this.#config = new Config();
    this.logger = new PinoLogger({
      name: 'EmailService',
      level: 'info',
      serviceVersion: process.env.SERVICE_VERSION || '1.0.0',
      environment: process.env.NODE_ENV || 'development'
    });

    this.#transporter = nodemailer.createTransport({
      host: this.#config.SMTP_HOST,
      port: this.#config.SMTP_PORT,
      secure: this.#config.SMTP_PORT === 465,
      auth: {
        user: this.#config.SMTP_USER,
        pass: this.#config.SMTP_PASS,
      },
    });
  }

  renderTemplate = async (template, data) => {
    try {
      const templatePath = path.join(
        __dirname,
        '../templates/email',
        `${template}.ejs`
      );
      const html = await ejs.renderFile(templatePath, data);
      return html;
    } catch (error) {
      this.#logger.error(`Failed to render email template: ${template}`, error);
      throw error;
    }
  };

  #sendEmail = async (to, subject, template, data) => {
    try {
      const html = await this.renderTemplate(template, data);
      const emailData = {
        from: `${this.#config.EMAIL_FROM_NAME} <${this.#config.EMAIL_FROM}>`,
        to,
        subject,
        html,
      };

      await this.#transporter.sendMail(emailData);

      this.#logger.info(`Email sent successfully to ${to}`);
    } catch (error) {
      this.#logger.error(`Failed to send email to ${to}`, error);
      throw error;
    }
  };

  sendVerificationEmail = async (recipient, data) => {
    await this.#sendEmail(
      recipient,
      'Verify Your Email Address',
      'verification',
      data
    );
  };

  sendWelcomeEmail = async (recipient, data) => {
    await this.#sendEmail(recipient, 'Welcome to Papdaew!', 'welcome', data);
  };
}

module.exports = EmailService;
