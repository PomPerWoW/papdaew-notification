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
│   ├── controllers/
│   ├── services/
│   ├── templates/
│   ├── utils/
│   ├── app.js
│   └── server.js
├── tests/
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
