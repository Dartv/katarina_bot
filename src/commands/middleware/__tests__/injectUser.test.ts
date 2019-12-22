import R from 'ramda';

import injectUser from '../injectUser';
import { createContext, setupDB, closeDB } from '../../../util/tests';
import { User } from '../../../models';
import { ErrorResponse } from '../../responses/ErrorResponse';

describe('injectUser', () => {
  const next = R.identity;

  beforeEach(setupDB);
  afterAll(closeDB);

  it('should create new user and inject it into the context if no user exists', async () => {
    const id = '123456789';
    const context = createContext({
      message: {
        author: { id },
      },
    });
    const user = await User.findOne({ discordId: id });

    expect(user).toBeNull();

    const nextContext = await injectUser()(next, context as any);

    expect(nextContext.user).toEqual(expect.anything());
    expect(nextContext.user.discordId).toBe(id);
  });

  it('should inject the user into the context if it exists', async () => {
    const id = '123456789';
    const context = createContext({
      message: {
        author: { id },
      },
    });
    const user = await new User({ discordId: id }).save();
    const nextContext = await injectUser()(next, context as any);
    const count = await User.find().count();

    expect(count).toBe(1);
    expect(user.toObject()).toEqual(nextContext.user.toObject());
  });

  it('should dispatch an error response', async () => {
    const context = createContext({
      message: {
        author: {
          id: {},
        },
      },
    });
    const response = await injectUser()(next, context as any);

    expect(response).toBeInstanceOf(ErrorResponse);
  });
});
