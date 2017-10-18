import gm from 'gm';
import path from 'path';
import request from 'request';
import R from 'ramda';
import { tmpdir } from 'os';

import { injectUser, expectUserToHaveImage } from './middleware';
import { COMMAND_TRIGGERS } from '../util/constants';
import * as params from '../util/parameters';
import { FileResponse, ErrorResponse } from './responses';

const WRITE_PATH = path.resolve(tmpdir(), '../tmp.png');

const autoWrap = R.compose(
  R.join(' '),
  R.flatten,
  R.intersperse('\n'),
  R.splitEvery(17),
);

export const middleware = [injectUser(), expectUserToHaveImage()];

const write = ({ width }, { image, args: { content } }) => new Promise((resolve, reject) => {
  const fontSize = width / 10;
  gm(request(image.url))
    .stroke('#000000')
    .fill('#ffffff')
    .font('Helvetica.ttf', fontSize)
    .drawText(0, fontSize, autoWrap(content.join(' ')), 'North')
    .write(WRITE_PATH, (err) => {
      if (err) reject(err);
      else resolve();
    });
});

const getImageSize = image => new Promise((resolve, reject) => {
  gm(image).size((err, val) => {
    if (err) reject(err);
    else resolve(val);
  });
});

const handler = async (context) => {
  const size = await getImageSize(request(context.image.url));

  try {
    await write(size, context);
  } catch (err) {
    return ErrorResponse(err.message, context);
  }

  return FileResponse('', [WRITE_PATH], context);
};

export default () => ({
  middleware,
  handler,
  parameters: [params.ref, params.content],
  triggers: COMMAND_TRIGGERS.WRITE,
  description: 'Writes on image',
});
