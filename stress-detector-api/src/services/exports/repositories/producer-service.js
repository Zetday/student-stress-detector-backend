import amqp from 'amqplib';

class ProducerService {
  constructor() {
    const rabbitUrl = process.env.RABBITMQ_URL;
    if (rabbitUrl) {
      this.amqpUri = rabbitUrl;
    } else {
      const user = process.env.RABBITMQ_USER || 'guest';
      const pass = process.env.RABBITMQ_PASSWORD || 'guest';
      const host = process.env.RABBITMQ_HOST || 'localhost';
      const port = process.env.RABBITMQ_PORT || '5672';
      this.amqpUri = `amqp://${user}:${pass}@${host}:${port}`;
    }
  }

  async sendMessage(queue, message) {
    let connection;
    let channel;
    try {
      connection = await amqp.connect(this.amqpUri);
      channel = await connection.createChannel();

      await channel.assertQueue(queue, {
        durable: true,
      });

      await channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)), {
        persistent: true,
      });
    } finally {
      if (channel) {
        await channel.close();
      }
      if (connection) {
        await connection.close();
      }
    }
  }
}

export default new ProducerService();
