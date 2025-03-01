const dotenv = require('dotenv');

dotenv.config({ path: '.env' });

class Config {
  constructor() {
    this.PORT = process.env.PORT || 3003;
    this.NODE_ENV = process.env.NODE_ENV || 'development';
    this.LOG_LEVEL = process.env.LOG_LEVEL || 'info';
    this.SERVICE_VERSION = process.env.SERVICE_VERSION || '1.0.0';
    this.RABBITMQ_URL = process.env.RABBITMQ_URL;
    this.EMAIL_PROVIDER = process.env.EMAIL_PROVIDER || 'nodemailer';
    this.EMAIL_FROM = process.env.EMAIL_FROM || 'noreply@papdaew.com';
    this.EMAIL_FROM_NAME = process.env.EMAIL_FROM_NAME || 'Papdaew';
    this.SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com';
    this.SMTP_PORT = process.env.SMTP_PORT || 587;
    this.SMTP_USER = process.env.SMTP_USER;
    this.SMTP_PASS = process.env.SMTP_PASS;
  }
}

module.exports = Config;
