import R from 'ramda';

import { createContext } from '../../../util/tests';
import validateJoinVoiceChannel, { ERRORS } from '../validateJoinVoiceChannel';

jest.mock('../../responses/ErrorResponse');

describe('validateJoinVoiceChannel', () => {
  const next = R.identity;

  it('should dispatch an error if the user is not in a voice channel', async () => {
    const context = createContext({
      message: {
        member: {
          voiceChannel: null,
        },
      },
    });
    const { executor } = await validateJoinVoiceChannel()(next, context);
    const response = await executor(context);

    expect(response).toBe(ERRORS.VC_NOT_FOUND);
  });

  it('should dispatch an error if the user is already in a voice channel', async () => {
    const context = createContext({
      message: {
        member: {
          voiceChannelID: 1,
        },
        guild: {
          voiceConnection: {
            channel: {
              id: 1,
            },
          },
        },
      },
    });
    const { executor } = await validateJoinVoiceChannel()(next, context);
    const response = await executor(context);

    expect(response).toBe(ERRORS.VC_ALREADY_IN);
  });

  it('should dispatch an error if the voice channel is not joinable', async () => {
    const context = createContext({
      message: {
        member: {
          voiceChannel: {
            joinable: false,
          },
        },
      },
    });
    const { executor } = await validateJoinVoiceChannel()(next, context);
    const response = await executor(context);

    expect(response).toBe(ERRORS.VC_NOT_JOINABLE);
  });

  it('should dispatch an error if the voice channel is not speakable', async () => {
    const context = createContext({
      message: {
        member: {
          voiceChannel: {
            joinable: true,
            speakable: false,
          },
        },
      },
    });
    const { executor } = await validateJoinVoiceChannel()(next, context);
    const response = await executor(context);

    expect(response).toBe(ERRORS.VC_NOT_SPEAKABLE);
  });

  it('should pass through if everything is ok', async () => {
    const context = createContext({
      message: {
        member: {
          voiceChannelID: 1,
          voiceChannel: {
            joinable: true,
            speakable: true,
          },
          guild: {
            voiceConnection: {
              channel: {
                id: 2,
              },
            },
          },
        },
      },
    });
    const nextContext = await validateJoinVoiceChannel()(next, context);

    expect(nextContext).toEqual(context);
  });
});
