import R from 'ramda';

import { ErrorResponse } from '../responses';
import { lenses, lensIsFalsy } from '../../util';
import { ERRORS } from '../../util/constants';

export default () => async (next, context) => R.cond([
  [lensIsFalsy(lenses.message.member.voiceChannel),
    ctx => ErrorResponse(ERRORS.VC_NOT_FOUND, ctx)],
  [R.allPass([
    R.view(lenses.message.guild.voiceConnection as any),
    R.converge(R.equals, [
      R.view(lenses.message.member.voiceChannelID as any),
      R.view(lenses.message.guild.voiceConnection.channel.id as any),
    ]),
  ]), ctx => ErrorResponse(ERRORS.VC_ALREADY_IN, ctx)],
  [lensIsFalsy(lenses.message.member.voiceChannel.joinable),
    ctx => ErrorResponse(ERRORS.VC_NOT_JOINABLE, ctx)],
  [lensIsFalsy(lenses.message.member.voiceChannel.speakable),
    ctx => ErrorResponse(ERRORS.VC_NOT_SPEAKABLE, ctx)],
  [R.T, next],
])(context);
