# Papdaew Notification Service

The notification service handles all types of notifications (email, SMS, push) for the Papdaew platform.

## Features

- Email notifications
  - Verification emails
  - Welcome emails
  - Password reset
  - Login alerts
- Message queue integration (RabbitMQ)
- Email templating (Handlebars)
- Multiple email providers support
  - SendGrid (default)
  - NodeMailer (fallback)

## Tech Stack

- Node.js
- Express.js
- RabbitMQ
- SendGrid/NodeMailer
- Handlebars
- Jest (testing)

## Project Structure

```
services/papdaew-notification/
├── src/
│   ├── configs/
│   │   ├── config.js
│   │   ├── database.config.js
│   │   └── messageBroker.config.js
│   ├── controllers/
│   │   └── health.controller.js
│   ├── services/
│   │   ├── email.service.js
│   │   └── notification.service.js
│   ├── templates/
│   │   ├── email/
│   │   │   ├── verification.hbs
│   │   │   └── welcome.hbs
│   │   └── helpers/
│   │       └── handlebars.js
│   ├── utils/
│   │   └── logger.js
│   ├── app.js
│   └── server.js
├── tests/
│   ├── unit/
│   └── integration/
├── .env.example
├── Dockerfile
├── package.json
└── README.md
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)

### Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy environment variables:

   ```bash
   cp .env.example .env
   ```

3. **Database Setup**

```bash
# Start PostgreSQL (if using Docker)
docker-compose up -d postgres

# Run database migrations
npx prisma migrate dev
```

4. Run the service:

   ```bash
   # Development
   npm run dev

   # Production
   npm start
   ```
