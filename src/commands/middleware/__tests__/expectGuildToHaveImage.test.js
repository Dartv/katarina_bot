import R from 'ramda';

import { createContext } from '../../../util/tests';
import expectGuildToHaveImage, {
  GUILD_DOESNT_HAVE_ANY_IMAGES,
  guildDoesntHaveImage,
} from '../expectGuildToHaveImage';

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
    const errorResponse = await expectGuildToHaveImage()(next, context);
    const response = await errorResponse.executor(context);

    expect(response.embed.fields[1].value).toBe(GUILD_DOESNT_HAVE_ANY_IMAGES);
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
    const errorResponse = await expectGuildToHaveImage()(next, context);
    const response = await errorResponse.executor(context);
    const expectedResponseMessage = guildDoesntHaveImage(context.args.ref);

    expect(response.embed.fields[1].value).toBe(expectedResponseMessage);
  });
});
