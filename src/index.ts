import { connectDB } from './services/mongo';
import { Client } from './services/client';
import { logger } from './services/logger';
import { ErrorResponse } from './commands/responses';
import { Trigger } from './utils/constants';
import { initJobs } from './jobs/agenda';

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

      client.user.setActivity(`${client.dispatcher.prefix}${client.commands.get('help').name}`);

      initJobs(client);
    });

    client.on('error', (err) => {
      client.logger.error(err.stack);
    });

    client.on('warn', (warn) => {
      client.logger.warn(warn);
    });

    client.on('parseArgumentsError', (error, commandName, message) => {
      client.dispatcher.dispatchCommand(Trigger.HELP[0], commandName, message);
    });

    client.on('dispatchError', (error, context) => {
      const { command } = context;
      client.logger.error(`Dispatch failed for command "${command.name}"`);
      client.logger.error(error);
      new ErrorResponse(context)
        .respond()
        .catch(client.logger.error);
    });

    client.login(BOT_TOKEN);
  })
  .catch((err) => {
    logger.fatal('An error has occured while trying to connect to DB');
    logger.fatal(err);
    process.exit(1);
  });
