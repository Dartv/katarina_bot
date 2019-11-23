import R from 'ramda';

import expectValidUrl, { INVALID_URL_PROVIDED } from '../expectValidUrl';
import { createContext } from '../../../util/tests';

jest.mock('../../responses/ErrorResponse');

describe('expectValidUrl', () => {
  const next = R.identity;

  it('should dispatch an error if the provided url is not valid', async () => {
    const context = createContext({
      args: {
        url: 'example..com',
      },
    });
    const { executor } = await expectValidUrl()(next, context);
    const response = await executor(context);

    expect(response).toBe(INVALID_URL_PROVIDED);
  });

  it('should pass through if the provided url is valid', async () => {
    const context = createContext({
      args: {
        url: 'http://example.com',
      },
    });
    const nextContext = await expectValidUrl()(next, context);

    expect(nextContext).toEqual(context);
  });
});
