import R from 'ramda';

import { createContext } from '../../../util/tests';
import expectGuildToHaveImage, { messages } from '../expectGuildToHaveImage';

describe('expectGuildToHaveImage', () => {
  const next = R.identity;

  it('should inject image to context args if the guild has image', async () => {
    const ref = 'fizz';
    const image = { ref };
    const context = createContext({
      args: { ref },
      guild: {
        images: [{ ref: 'buzz' }, image],
      },
    });
    const nextContext = await expectGuildToHaveImage('ref')(next, context);

    expect(nextContext.image).toEqual(image);
  });

  it('should dispatch an error when the guild doesn\'t have any images', async () => {
    const context = createContext({
      args: {
        ref: 'fizz',
      },
      guild: {
        images: [],
      },
    });
    const response = await expectGuildToHaveImage('ref')(next, context);

    expect(response.embed.fields[1].value).toBe(messages.msg1);
  });

  it('should dispatch an error when the guild doesn\'t have requested image', async () => {
    const context = createContext({
      args: {
        ref: 'fizz',
      },
      guild: {
        images: [{ ref: 'buzz' }],
      },
    });
    const response = await expectGuildToHaveImage('ref')(next, context);
    const expectedResponseMessage = messages.dynamic.msg1(context.args.ref);
    

    expect(response.embed.fields[1].value).toBe(expectedResponseMessage);
  });
});
