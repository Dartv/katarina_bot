import R from 'ramda';

export const lensInvoker = R.curry((arity, prop) => R.lens(R.invoker(arity, prop), R.assoc(prop)));

const message = R.lensProp('message');
const attachments = R.lensProp('attachments');
const url = R.lensProp('url');
const size = R.lensProp('size');
const args = R.lensProp('args');
const guild = R.lensProp('guild');
const images = R.lensProp('images');
const image = R.lensProp('image');
const ref = R.lensProp('ref');

const first = lensInvoker(0, 'first');

const messageAttachments = R.compose(message, attachments);
const messageAttachmentsSize = R.compose(messageAttachments, size);
const messageAttachmentsFirst = R.compose(messageAttachments, first);
const messageAttachmentsFirstUrl = R.compose(messageAttachmentsFirst, url);

const argsUrl = R.compose(args, url);
const argsRef = R.compose(args, ref);

const guildImages = R.compose(guild, images);

export default {
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
  }),
  guild: Object.assign(guild, {
    images: guildImages,
  }),
  image,
};
