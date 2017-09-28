const { Client } = require('ghastly');
const express = require('express');
require('dotenv').config({ path: './.env' });

const app = express();

const client = new Client({ prefix: '!' });

require('./services/mongo_connect');
require('./commands')(client);

client.on('ready', () => console.log('I\'m ready!'));

client.login(process.env.BOT_TOKEN);

app.listen(process.env.APP_PORT || 3000);
