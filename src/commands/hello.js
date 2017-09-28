const hello = () => {
  const handler = async () => 'world!';
  return {
    handler,
    triggers: ['hello'],
  };
};

module.exports = hello;
