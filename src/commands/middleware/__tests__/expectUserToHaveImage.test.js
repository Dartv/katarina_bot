import R from 'ramda';

import { createContext } from '../../../util/tests';
import expectUserToHaveImage, { messages } from '../expectUserToHaveImage';

describe('expectUserToHaveImage', () => {
  const next = R.identity;

  it('should inject image to context args if the user has image', async () => {
    const ref = 'foo';
    const image = { ref };
    const context = createContext({
      args: { ref },
      user: {
        images: [{ ref: 'bar' }, image],
      },
    });
    const nextContext = await expectUserToHaveImage()(next, context);

    expect(nextContext.image).toEqual(image);
  });

  it('should dispatch an error when the user doesn\'t have any images', async () => {
    const context = createContext({
      args: {
        ref: 'foo',
      },
      user: {
        images: [],
      },
    });
    const errorResponse = await expectUserToHaveImage()(next, context);
    const response = await errorResponse.executor(context);

    expect(response.embed.fields[1].value).toBe(messages.msg1);
  });

  it('should dispatch an error when the user doesn\'t have requested image', async () => {
    const context = createContext({
      args: {
        ref: 'foo',
      },
      user: {
        images: [{ ref: 'bar' }],
      },
    });
    const errorResponse = await expectUserToHaveImage()(next, context);
    const response = await errorResponse.executor(context);
    const expectedResponseMessage = messages.dynamic.msg1(context.args.ref);

    expect(response.embed.fields[1].value).toBe(expectedResponseMessage);
  });
});
