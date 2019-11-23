import R from 'ramda';

export const lensInvoker = R.curry((arity, prop) => R.lens(R.invoker(arity, prop), R.assoc(prop)));
export const last = R.lens(R.last, (val, array) => R.update(R.dec(R.length(array)), val, array));

export const lensIsFalsy = R.curry((lens, data) => (R.compose as any)(R.not, R.view)(lens, data));

export const viewOr = R.curryN(
  3,
  (defaultValue, lens, data) => R.defaultTo(defaultValue, R.view(lens, data)),
);

const message = R.lensProp('message');
const attachments = R.lensProp('attachments');
const url = R.lensProp('url');
const size = R.lensProp('size');
const args = R.lensProp('args');
const guild = R.lensProp('guild');
const images = R.lensProp('images');
const image = R.lensProp('image');
const ref = R.lensProp('ref');
const user = R.lensProp('user');
const parameters = R.lensProp('parameters');
const description = R.lensProp('description');
const optional = R.lensProp('optional');
const name = R.lensProp('name');
const member = R.lensProp('member');
const voiceChannel = R.lensProp('voiceChannel');
const voiceChannelID = R.lensProp('voiceChannelID');
const voiceConnection = R.lensProp('voiceConnection');
const id = R.lensProp('id');
const channel = R.lensProp('channel');
const joinable = R.lensProp('joinable');
const speakable = R.lensProp('speakable');
const entities = R.lensProp('entities');
const allIds = R.lensProp('allIds');
const player = R.lensProp('player');
const dispatcher = R.lensProp('dispatcher');
const paused = R.lensProp('paused');

const first = lensInvoker(0, 'first');
const end = lensInvoker(0, 'end');
const pause = lensInvoker(0, 'pause');
const resume = lensInvoker(0, 'resume');

const uploader = R.lensProp('uploader');
const value = R.lensProp('value');

const head = R.lensIndex(0);

const messageAttachments = R.compose(message, attachments);
const messageAttachmentsSize = R.compose(messageAttachments, size);
const messageAttachmentsFirst = R.compose(messageAttachments, first);
const messageAttachmentsFirstUrl = R.compose(messageAttachmentsFirst, url);
const messageMember = R.compose(message, member);
const messageMemberVoiceChannelID = R.compose(messageMember, voiceChannelID);
const messageMemberVoiceChannel = R.compose(messageMember, voiceChannel);
const messageMemberVoiceChannelJoinable = R.compose(messageMemberVoiceChannel, joinable);
const messageMemberVoiceChannelSpeakable = R.compose(messageMemberVoiceChannel, speakable);
const messageGuild = R.compose(message, guild);
const messageGuildVoiceConnection = R.compose(messageGuild, voiceConnection);
const messageGuildVoiceConnectionChannel = R.compose(messageGuildVoiceConnection, channel);
const messageGuildVoiceConnectionChannelId = R.compose(messageGuildVoiceConnectionChannel, id);
const messageGuildVoiceConnectionPlayer = R.compose(messageGuildVoiceConnection, player);
const messageGuildVoiceConnectionPlayerDispatcher = R.compose(
  messageGuildVoiceConnectionPlayer,
  dispatcher,
);
const messageGuildVoiceConnectionPlayerDispatcherEnd = R.compose(
  messageGuildVoiceConnectionPlayerDispatcher,
  end,
);
const messageGuildVoiceConnectionPlayerDispatcherPaused = R.compose(
  messageGuildVoiceConnectionPlayerDispatcher,
  paused,
);
const messageGuildVoiceConnectionPlayerDispatcherPause = R.compose(
  messageGuildVoiceConnectionPlayerDispatcher,
  pause,
);
const messageGuildVoiceConnectionPlayerDispatcherResume = R.compose(
  messageGuildVoiceConnectionPlayerDispatcher,
  resume,
);

const argsUrl = R.compose(args, url);
const argsRef = R.compose(args, ref);

const guildImages = R.compose(guild, images);

const userImages = R.compose(user, images);

const allIdsLast = R.compose(allIds, last);
const allIdsHead = R.compose(allIds, head);

const entity = entityId => R.compose(entities, R.lensProp(entityId));

export default {
  parameters,
  description,
  image,
  optional,
  name,
  ref,
  uploader,
  value,
  args: Object.assign(args, {
    url: argsUrl,
    ref: argsRef,
  }),
  message: Object.assign(message, {
    attachments: Object.assign(messageAttachments, {
      size: messageAttachmentsSize,
      first: Object.assign(messageAttachmentsFirst, {
        url: messageAttachmentsFirstUrl,
      }),
    }),
    member: Object.assign(messageMember, {
      voiceChannelID: messageMemberVoiceChannelID,
      voiceChannel: Object.assign(messageMemberVoiceChannel, {
        joinable: messageMemberVoiceChannelJoinable,
        speakable: messageMemberVoiceChannelSpeakable,
      }),
    }),
    guild: Object.assign(messageGuild, {
      voiceConnection: Object.assign(messageGuildVoiceConnection, {
        channel: Object.assign(messageGuildVoiceConnectionChannel, {
          id: messageGuildVoiceConnectionChannelId,
        }),
        player: Object.assign(messageGuildVoiceConnectionPlayer, {
          dispatcher: Object.assign(messageGuildVoiceConnectionPlayerDispatcher, {
            end: messageGuildVoiceConnectionPlayerDispatcherEnd,
            paused: messageGuildVoiceConnectionPlayerDispatcherPaused,
            pause: messageGuildVoiceConnectionPlayerDispatcherPause,
            resume: messageGuildVoiceConnectionPlayerDispatcherResume,
          }),
        }),
      }),
    }),
  }),
  guild: Object.assign(guild, {
    images: guildImages,
  }),
  user: Object.assign(user, {
    images: userImages,
  }),
  entities: Object.assign(entities, {
    entity,
  }),
  allIds: Object.assign(allIds, {
    last: allIdsLast,
    head: allIdsHead,
  }),
};
