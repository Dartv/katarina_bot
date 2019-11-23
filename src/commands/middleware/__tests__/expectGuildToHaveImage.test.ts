import R from 'ramda';

import { createContext } from '../../../util/tests';
import expectGuildToHaveImage, {
  GUILD_DOESNT_HAVE_ANY_IMAGES,
  guildDoesntHaveImage,
} from '../expectGuildToHaveImage';

jest.mock('../../responses/ErrorResponse');

describe('expectGuildToHaveImage', () => {
  const next = R.identity;

  it('should inject image to context args if the guild has image', async () => {
    const ref = 'foo';
    const image = { ref };
    const context = createContext({
      args: { ref },
      guild: {
        images: [{ ref: 'bar' }, image],
      },
    });
    const nextContext = await expectGuildToHaveImage()(next, context);

    expect(nextContext.image).toEqual(image);
  });

  it('should dispatch an error when the guild doesn\'t have any images', async () => {
    const context = createContext({
      args: {
        ref: 'foo',
      },
      guild: {
        images: [],
      },
    });
    const { executor } = await expectGuildToHaveImage()(next, context);
    const response = await executor(context);

    expect(response).toBe(GUILD_DOESNT_HAVE_ANY_IMAGES);
  });

  it('should dispatch an error when the guild doesn\'t have requested image', async () => {
    const context = createContext({
      args: {
        ref: 'foo',
      },
      guild: {
        images: [{ ref: 'bar' }],
      },
    });
    const { executor } = await expectGuildToHaveImage()(next, context);
    const response = await executor(context);
    const expectedResponseMessage = guildDoesntHaveImage(context.args.ref);

    expect(response).toBe(expectedResponseMessage);
  });
});
