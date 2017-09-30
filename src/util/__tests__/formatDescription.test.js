const { formatDescription } = require('../');

describe('formatDescription', () => {
  const commandName = 'test';
  const description = 'description';
  const usage = '<param>';

  beforeEach(() => {
    process.env.BOT_PREFIX = '!';
  });

  it('should return raw string if argument is a string', () => {
    expect(formatDescription(description)).toBe(description);
  });

  it('should return just a description if no "usage" property provided', () => {
    expect(formatDescription({ description })).toBe(description);
  });

  it('should properly format description', () => {
    const actual = formatDescription({ commandName, description, usage });
    expect(actual).toMatchSnapshot();
  });
});
