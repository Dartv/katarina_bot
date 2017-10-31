import { injectUser, expectUserToHaveImage, injectImageSize, drawImageText } from './middleware';
import { COMMAND_TRIGGERS, TMP_IMAGE_PATH } from '../util/constants';
import * as params from '../util/parameters';
import { FileResponse } from './responses';

export const middleware = [
  injectUser(),
  expectUserToHaveImage(),
  injectImageSize(),
  drawImageText(),
];

export const handler = async context => FileResponse('', [TMP_IMAGE_PATH], context);

export default () => ({
  middleware,
  handler,
  parameters: [params.ref, {
    ...params.content,
    optional: false,
  }],
  triggers: COMMAND_TRIGGERS.WRITE,
  description: 'Writes text on image',
});
