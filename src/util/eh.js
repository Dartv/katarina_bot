import random from 'random-int';
import { compose, reduce, keys, replace, defaultTo } from 'ramda';

import { EH_URL } from './constants';

export const getLastPage = $ => +$('.ptt')
  .find('td')
  .last()
  .prev()
  .text();

export const getRandomPage = compose(random, getLastPage);

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
