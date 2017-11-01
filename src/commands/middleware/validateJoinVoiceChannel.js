import R from 'ramda';

import { ErrorResponse } from '../responses';
import { lenses, lensIsFalsy } from '../../util';

export const ERRORS = {
  VC_NOT_FOUND: 'You should join the voice channel first',
  VC_ALREADY_IN: 'I\'m already in your voice channel',
  VC_NOT_JOINABLE: 'I\'m not allowed to join your voice channel',
  VC_NOT_SPEAKABLE: 'I\'m not allowed to speak in your voice channel',
};

export default () => async (next, context) => R.cond([
  [lensIsFalsy(lenses.message.member.voiceChannel),
    ErrorResponse(ERRORS.VC_NOT_FOUND)],
  [R.allPass([
    R.view(lenses.message.guild.voiceConnection),
    R.converge(R.equals, [
      R.view(lenses.message.member.voiceChannelID),
      R.view(lenses.message.guild.voiceConnection.channel.id),
    ]),
  ]), ErrorResponse(ERRORS.VC_ALREADY_IN)],
  [lensIsFalsy(lenses.message.member.voiceChannel.joinable),
    ErrorResponse(ERRORS.VC_NOT_JOINABLE)],
  [lensIsFalsy(lenses.message.member.voiceChannel.speakable),
    ErrorResponse(ERRORS.VC_NOT_SPEAKABLE)],
  [R.T, next],
])(context);
