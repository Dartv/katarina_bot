import random from 'random-int';
import { compose, reduce, keys, replace, defaultTo, curry } from 'ramda';

import { EH_URL } from './constants';
import { getRandomArrayIndex } from './helpers';

export const constructRequestUrl = qparams => compose(
  replace(/&$/, ''),
  reduce((url, key) => {
    const qparam = `${key}=${qparams[key]}`;
    if (url === EH_URL) return `${url}/?${qparam}&`;
    return `${url}${qparam}&`;
  }, EH_URL),
  keys,
  defaultTo({}),
)(qparams);

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
