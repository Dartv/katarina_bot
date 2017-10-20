import R from 'ramda';

export const lensInvoker = R.curry((arity, prop) => R.lens(R.invoker(arity, prop), R.assoc(prop)));
export const last = R.lens(R.last, (val, array) => R.update(R.dec(R.length(array)), val, array));

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

const first = lensInvoker(0, 'first');

const messageAttachments = R.compose(message, attachments);
const messageAttachmentsSize = R.compose(messageAttachments, size);
const messageAttachmentsFirst = R.compose(messageAttachments, first);
const messageAttachmentsFirstUrl = R.compose(messageAttachmentsFirst, url);

const argsUrl = R.compose(args, url);
const argsRef = R.compose(args, ref);

const guildImages = R.compose(guild, images);

const userImages = R.compose(user, images);

export default {
  parameters,
  description,
  image,
  optional,
  name,
  ref,
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
  user: Object.assign(user, {
    images: userImages,
  }),
};
