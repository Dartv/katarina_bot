const add = require('./add');
const post = require('./post');
const list = require('./list');
const remove = require('./remove');
const removeAll = require('./removeAll');
const art = require('./art');

const commands = [add, post, list, remove, removeAll, art];

module.exports = client => client.commands.add(...commands);
