import random from 'random-int';
import { compose, reduce, keys, replace, defaultTo, curry, invoker } from 'ramda';
import cheerio from 'cheerio';
import { readFile } from 'mz/fs';

import { EH_URL, EH_HTML_PATH } from './constants';
import { getRandomArrayIndex } from './helpers';

export const constructRequestUrl = curry((url, qparams) => compose(
  replace(/&$/, ''),
  reduce((acc, key) => {
    const qparam = `${key}=${qparams[key]}`;
    if (acc === url) return `${acc}/?${qparam}&`;
    return `${acc}${qparam}&`;
  }, url),
  keys,
  defaultTo({}),
)(qparams));

export const getLastPage = $ => +$('.ptt')
  .find('td')
  .last()
  .prev()
  .text();
export const getRandomPage = compose(random, getLastPage);

export const getTags = curry((q, $) => $(`a[href*="${EH_URL}/${q}/"]`));
export const getGalleryTags = getTags('g');
export const getImageTags = getTags('s');
export const getRandomLink = curry((f, $) => {
  const tags = f($);
  const idx = getRandomArrayIndex(tags);
  const tag = tags[idx];
  return $(tag).attr('href');
});
export const getRandomGalleryLink = getRandomLink(getGalleryTags);
export const getRandomImageLink = getRandomLink(getImageTags);


export const getHtml = invoker(0, 'text');
export const getImageSrc = $ => $('#img').attr('src');
export const readHtmlFromCache = async () => {
  const html = await readFile(EH_HTML_PATH, 'utf8');
  return cheerio.load(html);
};
