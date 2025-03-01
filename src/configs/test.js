const MessageBroker = require('./newmessageBroker.config.js');

async function testRabbitMQ() {
  const broker = new MessageBroker();
  
  try {
    console.log('Connecting to RabbitMQ...');
    await broker.connect();
    console.log('Connected to RabbitMQ successfully.');

    const testMessage = JSON.stringify({
      type: 'WELCOME',
      recipient: 'test@example.com',
      data: { name: 'Test User' }
    });

    console.log('Publishing message to email_notifications queue...');
    await broker.publishDirect('email_notifications', testMessage, 'Test message sent');
    
    console.log('Message published successfully!');
    
    setTimeout(async () => {
      console.log('Disconnecting...');
      await broker.disconnect();
      console.log('Disconnected successfully.');
      process.exit(0);
    }, 5000);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

testRabbitMQ();
