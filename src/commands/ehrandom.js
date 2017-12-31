import fetch from 'node-fetch';
import cheerio from 'cheerio';
import { objOf } from 'ramda';

import {
  constructRequestUrl,
  getRandomPage,
  getRandomGalleryLink,
  getRandomImageLink,
  COMMAND_TRIGGERS,
  EH_URL,
  readHtmlFromCache,
  getHtml,
  getImageSrc,
} from '../util';
import { FileResponse, ErrorResponse } from './responses';
import { withCooldown } from './middleware';

export const middleware = [withCooldown(5000)];

export const handler = async context => readHtmlFromCache()
  .then(getRandomPage)
  .then(objOf('page'))
  .then(constructRequestUrl(EH_URL))
  .then(fetch)
  .then(getHtml)
  .then(cheerio.load.bind(cheerio))
  .then(getRandomGalleryLink)
  .then(url => fetch(url)
    .then(getHtml)
    .then(cheerio.load.bind(cheerio))
    .then(getRandomPage)
    .then(objOf('p'))
    .then(constructRequestUrl(url))
    .then(fetch)
    .then(getHtml)
    .then(cheerio.load.bind(cheerio))
    .then(getRandomImageLink)
    .then(fetch)
    .then(getHtml)
    .then(cheerio.load.bind(cheerio))
    .then(getImageSrc)
    .then(src => FileResponse('', [src], context))
    .catch(err => ErrorResponse(err.message, context)))
  .catch(err => ErrorResponse(err.message, context));

export default () => ({
  handler,
  middleware,
  triggers: COMMAND_TRIGGERS.EHRANDOM,
  description: 'Posts random EH image from a random gallery',
});
