const add = require('./add');
const post = require('./post');
const list = require('./list');

const commands = [add, post, list];

module.exports = client => client.commands.add(...commands);
