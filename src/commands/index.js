const hello = require('./hello');

const commands = [hello];

module.exports = client => commands.forEach(cmd => client.commands.add(cmd));
