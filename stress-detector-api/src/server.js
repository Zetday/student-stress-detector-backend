import server from './server/index.js';
import consumer from './services/exports/consumer.js';

const port = process.env.PORT;
const host = process.env.HOST;

server.listen(port, () => {
  console.log(`Server running at http://${host}:${port}`);

  // Start the background RabbitMQ consumer
  consumer.start();
});
