import R from 'ramda';
import request from 'request';

import { gm } from '../../util';
import { FONTS, COLORS, DIRECTIONS, TMP_IMAGE_PATH } from '../../util/constants';
import { autoWrap } from '../../util/helpers';

const calcFontSize = R.divide(R.__, 10);
const BREAK_AT = 18;
const MAX_WIDTH_TO_STROKE = 400;

export default ({
  font = FONTS.ttf(FONTS.HELVETICA),
  fillColor = COLORS.WHITE,
  strokeColor = COLORS.BLACK,
} = {}) => async (next, context) => {
  const { image: { size: { width }, url }, args: { content } } = context;
  const fontSize = calcFontSize(width);
  const text = autoWrap(BREAK_AT)(content);
  const image = gm(request(url))
    .fill(fillColor)
    .font(font, fontSize);

  if (width >= MAX_WIDTH_TO_STROKE) {
    const strokeWidth = Math.max(1, Math.round(fontSize / 100));
    image.stroke(strokeColor, strokeWidth);
  }

  image.drawText(0, fontSize, text, DIRECTIONS.NORTH);

  await image.write(TMP_IMAGE_PATH);

  return next(context);
};
