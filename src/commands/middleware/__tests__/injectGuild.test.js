import R from 'ramda';

import injectGuild from '../injectGuild';
import { createContext, setupDB, closeDB } from '../../../util/tests';
import { Guild } from '../../../models';
import { ErrorResponse } from '../../responses/ErrorResponse';

describe('injectGuild', () => {
  const next = R.identity;

  beforeEach(setupDB);
  afterAll(closeDB);

  it('should create a new guild and inject it into the context if no guild exists', async () => {
    const id = '123456789';
    const context = createContext({
      message: {
        guild: { id },
      },
    });
    const guild = await Guild.findOne({ discordId: id });

    expect(guild).toBeNull();

    const nextContext = await injectGuild()(next, context);

    expect(nextContext.guild).toEqual(expect.anything());
    expect(nextContext.guild.discordId).toBe(id);
  });

  it('should inject the guild into the context if it exists', async () => {
    const id = '123456789';
    const context = createContext({
      message: {
        guild: { id },
      },
    });
    const guild = await new Guild({ discordId: id }).save();
    const nextContext = await injectGuild()(next, context);
    const count = await Guild.find().count();

    expect(count).toBe(1);
    expect(guild.toObject()).toEqual(nextContext.guild.toObject());
  });

  it('should dispatch an error response', async () => {
    const context = createContext({
      message: {
        guild: {
          id: {},
        },
      },
    });
    const response = await injectGuild()(next, context);

    expect(response).toBeInstanceOf(ErrorResponse);
  });
});
