import server from './server/index.js';
import consumer from './services/exports/consumer.js';

const portEnv = process.env.PORT;
const host = process.env.HOST || 'localhost';
const port = Number(portEnv) || 3000;

if (Number.isNaN(Number(portEnv))) {
  console.warn(`Warning: invalid PORT value '${portEnv}' — falling back to ${port}`);
}

server.listen(port, () => {
  console.log(`Server running at http://${host}:${port}`);

  // Start the background RabbitMQ consumer
  consumer.start();
});
