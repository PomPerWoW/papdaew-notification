# Papdaew Notification Service

The notification service handles all types of notifications (email, SMS, push) for the Papdaew platform.

## Features

- Email notifications
  - Verification emails
  - Welcome emails
  - Password reset
  - Login alerts
- Message queue integration (RabbitMQ)
- Email templating (ejs)
- Email providers support
  - SendGrid (default)
  - NodeMailer (fallback)

## Tech Stack

- Node.js
- Express.js
- RabbitMQ
- NodeMailer

## Project Structure

```
services/papdaew-notification/
├── src/
│   ├── configs/
│   ├── controllers/
│   ├── events/
│   ├── services/
│   ├── templates/
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

3. Run the service:

   ```bash
   # Development
   npm run dev

   # Production
   npm start
   ```
