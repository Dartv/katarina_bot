import { Client, ICommandContext } from 'ghastly';
import YouTube from 'simple-youtube-api';
import Danbooru from 'danbooru';
import MarkdownFormatter from 'ghastly/lib/utils/MarkdownFormatter';
import Snoowrap from 'snoowrap';

import { COMMAND_TRIGGERS } from './util/constants';
import store from './store';
import { ErrorResponse } from './commands/responses';
import { connectDB } from './services/mongo_connect';
import installCommands from './commands';
import { logger } from './util/logger';
import initAgenda from './jobs';
import { installPlugins } from './plugins';

const {
  BOT_PREFIX: prefix,
  BOT_TOKEN,
  YOUTUBE_API_KEY,
  DANBOORU_LOGIN,
  DANBOORU_API_KEY,
  REDDIT_USERNAME,
  REDDIT_PASSWORD,
  REDDIT_CLIENT_ID,
  REDDIT_CLIENT_SECRET,
  REDDIT_USERAGENT,
} = process.env;

connectDB()
  .then(() => {
    const client = new Client({ prefix });

    client.services.instance('music.youtube', new YouTube(YOUTUBE_API_KEY));
    client.services.instance('music.store', store);
    client.services.instance('danbooru', new Danbooru(`${DANBOORU_LOGIN}:${DANBOORU_API_KEY}`));
    client.services.instance(
      'reddit',
      new Snoowrap({
        userAgent: REDDIT_USERAGENT,
        clientId: REDDIT_CLIENT_ID,
        clientSecret: REDDIT_CLIENT_SECRET,
        username: REDDIT_USERNAME,
        password: REDDIT_PASSWORD,
      }),
    );

    client.on('ready', async () => {
      console.log('I\'m ready!');
      client.user.setActivity(`${prefix}${COMMAND_TRIGGERS.HELP[0]}`);
      initAgenda(client);
    });

    client.on('dispatchFail', (reason, context: ICommandContext) => {
      const { error, command } = context;
      if (error) {
        console.error(`Dispatch failed for command ${command}`);
        console.error(reason, error);
        if (reason === 'handlerError') {
          const response = ErrorResponse(
            'Something went wrong...',
            { ...context, formatter: MarkdownFormatter },
          );
          response.respond().catch(console.error);
        }
      }
    });

    installCommands(client);
    installPlugins(client);

    client.login(BOT_TOKEN);
  })
  .catch((err) => {
    logger.fatal('An error has occured while trying to connect to DB');
    logger.fatal(err);
    process.exit(1);
  });
