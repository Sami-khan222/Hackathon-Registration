const { env, validateEnv } = require('./config/env');

const start = async () => {
  validateEnv();
  const connectDB = require('./config/db');
  const app = require('./app');
  const { verifyEmailTransport } = require('./services/emailService');

  await connectDB();

  // Surface SMTP misconfiguration at boot rather than on the first signup
  verifyEmailTransport()
    .then(() => console.log('Gmail SMTP connection verified.'))
    .catch((error) => console.warn(`Gmail SMTP check failed: ${error.message}. Emails will not be delivered until EMAIL_USER / EMAIL_PASS are fixed.`));

  const server = app.listen(env.port, () => console.log(`API listening on port ${env.port} (${env.nodeEnv})`));

  const shutdown = () => server.close(() => process.exit(0));
  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
};

start().catch((error) => {
  console.error(`Failed to start server: ${error.message}`);
  process.exit(1);
});
