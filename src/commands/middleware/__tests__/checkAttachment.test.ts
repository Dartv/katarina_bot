import R from 'ramda';

import { checkAttachment } from '..';

describe('checkAttachment', () => {
  const next = R.identity;

  it('should inject url into context args if the message has attachments', async () => {
    const url = 'hello world';
    const context = {
      args: {},
      message: {
        attachments: {
          first: () => ({ url }),
          size: 1,
        },
      },
    };
    const nextContext = await checkAttachment()(next, context);

    expect((nextContext as any).args.url).toBe(url);
  });

  it('should pass context further as it is if the message doesn\'t have attachments', async () => {
    const context = {
      message: {
        attachments: {
          size: 0,
        },
      },
    };
    const nextContext = await checkAttachment()(next, context);

    expect(nextContext).toEqual(context);
  });
});
