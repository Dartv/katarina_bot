import fetch from 'node-fetch';
import cheerio from 'cheerio';
import { join } from 'path';
import { tmpdir } from 'os';
import { readFile } from 'mz/fs';
import { objOf, invoker } from 'ramda';

import {
  constructRequestUrl,
  getRandomPage,
  getRandomGalleryLink,
  getRandomImageLink,
  COMMAND_TRIGGERS,
  EH_URL,
} from '../util';
import { FileResponse, ErrorResponse } from './responses';
import { withCooldown } from './middleware';

export const middleware = [withCooldown(5000)];

const HTML_FILE_PATH = join(tmpdir(), 'eh.html');

const get$ = async () => {
  const html = await readFile(HTML_FILE_PATH, 'utf8');
  return cheerio.load(html);
};

const getHtml = invoker(0, 'text');
const getImageSrc = $ => $('#img').attr('src');

export const handler = async context => get$()
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
