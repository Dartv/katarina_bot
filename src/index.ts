import { connectDB } from './services/mongo';
import { Client } from './services/client';
import { logger } from './services/logger';

const {
  BOT_PREFIX,
  BOT_TOKEN,
} = process.env;

connectDB()
  .then(() => {
    const client = new Client({
      prefix: BOT_PREFIX,
      retryLimit: Infinity,
    });

    client.on('ready', () => {
      client.logger.info(`I'm ready as ${client.user.tag} ${client.user.id}`);

      client.user.setActivity(`${client.dispatcher.prefix}`);
    });

    client.on('error', (err) => {
      client.logger.error(err.stack);
    });

    client.on('warn', (warn) => {
      client.logger.warn(warn);
    });

    client.on('parseArgumentsError', (error, commandName) => {
      const command = client.commands.get(commandName);

      console.log(command);
    });

    client.login(BOT_TOKEN);
  })
  .catch((err) => {
    logger.fatal('An error has occured while trying to connect to DB');
    logger.fatal(err);
    process.exit(1);
  });
