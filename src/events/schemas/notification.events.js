const EMAIL_NOTIFICATION = {
  type: 'object',
  required: ['type', 'recipient', 'data'],
  properties: {
    type: {
      type: 'string',
      enum: ['WELCOME', 'VERIFICATION', 'RESET_PASSWORD'],
    },
    recipient: { type: 'string', format: 'email' },
    data: {
      type: 'object',
      properties: {
        username: { type: 'string' },
        verificationUrl: { type: 'string' },
        resetUrl: { type: 'string' },
        orderDetails: { type: 'object' },
      },
    },
  },
};

const PUSH_NOTIFICATION = {
  type: 'object',
  required: ['userId', 'title', 'body'],
  properties: {
    userId: { type: 'string' },
    title: { type: 'string' },
    body: { type: 'string' },
    data: { type: 'object' },
    timestamp: { type: 'string', format: 'date-time' },
  },
};

module.exports = {
  EMAIL_NOTIFICATION,
  PUSH_NOTIFICATION,
};
