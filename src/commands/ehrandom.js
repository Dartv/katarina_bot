import fetch from 'node-fetch';
import cheerio from 'cheerio';
import { join } from 'path';
import { tmpdir } from 'os';
import { readFile } from 'mz/fs';
import random from 'random-int';

import { COMMAND_TRIGGERS, EH_URL } from '../util/constants';
import { FileResponse, ErrorResponse } from './responses';

const HTML_FILE_PATH = join(tmpdir(), 'eh.html');

const get$ = async () => {
  const html = await readFile(HTML_FILE_PATH, 'utf8');
  return cheerio.load(html);
};

let COOLDOWN_AT = Date.now();

export const handler = async (context) => {
  if ((Date.now() - COOLDOWN_AT) / 1000 < 5) {
    return ErrorResponse('You\'re spamming too much... Please, wait for a few seconds.', context);
  }

  COOLDOWN_AT = Date.now();

  try {
    let $ = await get$();
    let lastPage = +$('.ptt')
    .find('td')
    .last()
    .prev()
    .text();
    let randomPage = random(lastPage);
    let res = await fetch(`${EH_URL}/?page=${randomPage}`);
    let html = await res.text();
    $ = cheerio.load(html);
    let tags = $(`a[href*="${EH_URL}/g/"]`);
    let idx = random(tags.length - 1);
    let tag = tags[idx];
    res = await fetch($(tag).attr('href'));
    html = await res.text();
    $ = cheerio.load(html);
    lastPage = +$('.ptt')
    .find('td')
    .last()
    .prev()
    .text();
    randomPage = random(lastPage);
    res = await fetch(`${$(tag).attr('href')}/?p=${randomPage}`);
    html = await res.text();
    $ = cheerio.load(html);
    tags = $(`a[href*="${EH_URL}/s/"]`);
    idx = random(tags.length - 1);
    tag = tags[idx];
    res = await fetch($(tag).attr('href'));
    html = await res.text();
    $ = cheerio.load(html);
    const image = $('#img');
    const src = image.attr('src');
    return FileResponse('', [src], context);
  } catch (err) {
    return ErrorResponse(err.message, context);
  }
};

export default () => ({
  handler,
  triggers: COMMAND_TRIGGERS.EHRANDOM,
  description: 'Posts random EH page',
});
