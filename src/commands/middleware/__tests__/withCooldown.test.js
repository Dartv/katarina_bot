import { T } from 'ramda';

import withCooldown from '../withCooldown';
import { createContext } from '../../../util/tests';
import { ERRORS } from '../../../util/constants';

jest.mock('../../responses/ErrorResponse');

describe('withCooldown', () => {
  it('throws if used too often', async () => {
    const COOLDOWN = 500;
    const middleware = withCooldown(COOLDOWN, ERRORS.CMD_CD);
    const next = context => middleware(T, context);
    const context = createContext({});
    const { executor } = await middleware(next, context);
    const response = await executor(context);

    expect(response).toBe(ERRORS.CMD_CD);
  });

  it('does not throw if used not too often', async () => {
    const COOLDOWN = 500;
    const middleware = withCooldown(COOLDOWN, ERRORS.CMD_CD);
    const next = context => new Promise((resolve) => {
      setTimeout(async () => {
        const response = await middleware(T, context);
        resolve(response);
      }, COOLDOWN);
    });
    const context = createContext({});
    const response = await middleware(next, context);

    expect(response).toBe(true);
  });

  it('does not throw when using different instances', async () => {
    const COOLDOWN = 500;
    const middleware1 = withCooldown(COOLDOWN, ERRORS.CMD_CD);
    const middleware2 = withCooldown(COOLDOWN, ERRORS.CMD_CD);
    const next = context => middleware2(T, context);
    const context = createContext({});
    const response = await middleware1(next, context);

    expect(response).toBe(true);
  });
});
