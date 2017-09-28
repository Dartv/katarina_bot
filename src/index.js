const { Client } = require('ghastly');
const express = require('express');
const bodyParser = require('body-parser');
require('dotenv').config({ path: './.env' });

const app = express();

app.use(bodyParser.json());

const client = new Client({ prefix: '!' });

require('./services/mongo_connect');
require('./commands')(client);

client.on('ready', () => console.log('I\'m ready!'));

client.login(process.env.BOT_TOKEN);

app.listen(process.env.APP_PORT || 3000);
