const { Client } = require('ghastly');
require('dotenv').config({ path: './.env' });

const prefix = process.env.BOT_PREFIX || 'kat!';

const client = new Client({ prefix });

require('./services/mongo_connect');
require('./commands')(client);

client.on('ready', () => {
  console.log('I\'m ready!');
  client.user.setGame(prefix);
});

client.login(process.env.BOT_TOKEN);
