import R from 'ramda';

export const lensInvoker = R.curry((arity, prop) => R.lens(R.invoker(arity, prop), R.assoc(prop)));

export const message = R.lensProp('message');
export const attachments = R.lensProp('attachments');
export const url = R.lensProp('url');
export const size = R.lensProp('size');
export const args = R.lensProp('args');

export const first = lensInvoker(0, 'first');

export const messageAttachments = R.compose(message, attachments);
export const messageAttachmentsSize = R.compose(messageAttachments, size);
export const messageAttachmentsFirstUrl = R.compose(messageAttachments, first, url);
export const argsUrl = R.compose(args, url);

export default {
  args: {
    url: argsUrl,
  },
  message: {
    attachments: {
      size: messageAttachmentsSize,
      first: {
        url: messageAttachmentsFirstUrl,
      },
    },
  },
};
