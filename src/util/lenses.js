import R from 'ramda';

import { mapDeep } from './fp';

export const lensInvoker = R.curry((arity, prop) => R.lens(R.invoker(arity, prop), R.assoc(prop)));

const message = R.lensProp('message');
const attachments = R.lensProp('attachments');
const url = R.lensProp('url');
const size = R.lensProp('size');
const args = R.lensProp('args');

const first = lensInvoker(0, 'first');

const messageAttachments = R.compose(message, attachments);
const messageAttachmentsSize = R.compose(messageAttachments, size);
const messageAttachmentsFirst = R.compose(messageAttachments, first);
const messageAttachmentsFirstUrl = R.compose(messageAttachmentsFirst, url);
const argsUrl = R.compose(args, url);

export const lenses = {
  args: {
    identity: args,
    url: argsUrl,
  },
  message: {
    identity: message,
    attachments: {
      identity: messageAttachments,
      size: messageAttachmentsSize,
      first: {
        identity: messageAttachmentsFirst,
        url: messageAttachmentsFirstUrl,
      },
    },
  },
};

export default mapDeep(val => ({
  view: R.view(val),
  set: R.set(val),
  over: R.over(val),
}), lenses);
