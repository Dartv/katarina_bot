module.exports = (command, description, usage) => `
${description}

usage: \`${process.env.BOT_PREFIX}${command} ${usage}\`
`;
