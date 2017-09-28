const add = require('./add');

const commands = [add];

module.exports = client => client.commands.add(...commands);
