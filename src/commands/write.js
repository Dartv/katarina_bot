import path from 'path';
import request from 'request';
import R from 'ramda';
import { tmpdir } from 'os';

import { gm } from '../util';
import { injectUser, expectUserToHaveImage } from './middleware';
import { COMMAND_TRIGGERS, COLORS, FONTS, DIRECTIONS } from '../util/constants';
import * as params from '../util/parameters';
import { autoWrap } from '../util/helpers';
import { FileResponse, ErrorResponse } from './responses';

const WRITE_PATH = path.resolve(tmpdir(), '../tmp.png');
const BREAK_AT = 18;

const calcFontSize = R.divide(R.__, 10);

export const middleware = [injectUser(), expectUserToHaveImage()];

const write = ({ width }, { image, args: { content } }) => {
  const fontSize = calcFontSize(width);
  const text = R.join(' ', autoWrap(BREAK_AT)(content));
  const img = gm(request(image.url))
    .fill(COLORS.WHITE)
    .font(FONTS.ttf(FONTS.HELVETICA), fontSize);

  if (width >= 400) {
    const strokeWidth = Math.max(1, Math.round(fontSize / 100));
    img.stroke(COLORS.BLACK, strokeWidth);
  }

  img.drawText(0, fontSize, text, DIRECTIONS.NORTH);

  return img.write(WRITE_PATH);
};


export const handler = async (context) => {
  try {
    const size = await gm(request(context.image.url)).size();
    await write(size, context);
  } catch (err) {
    return ErrorResponse(err.message, context);
  }

  return FileResponse('', [WRITE_PATH], context);
};

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
