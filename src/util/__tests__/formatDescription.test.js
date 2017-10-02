import { formatDescription } from '../';

describe('formatDescription', () => {
  const commandName = 'test';
  const description = 'description';
  const parameters = [
    { description: 'fizz' },
    { description: 'buzz' },
  ];

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
    const actual = formatDescription({ commandName, description, parameters });
    expect(actual).toMatchSnapshot();
  });
});
