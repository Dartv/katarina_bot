import cheerio from 'cheerio';
import { times, map } from 'ramda';
import random from 'random-int';

import {
  getLastPage,
  constructRequestUrl,
  getGalleryTags,
  getRandomGalleryLink,
} from '../eh';
import { EH_URL } from '../constants';

describe('eh', () => {
  describe('getLastPage', () => {
    it('gets last page number', () => {
      const html = `
        <table class="ptt">
          <tbody>
            <td><</td>
            <td>1</td>
            <td>2</td>
            <td>3</td>
            <td>4</td>
            <td>5</td>
            <td>></td>
          </tbody>
        </table>
      `;
      const $ = cheerio.load(html);

      expect(getLastPage($)).toBe(5);
    });
  });

  describe('constructRequestUrl', () => {
    it('constructs proper url if params are provided', () => {
      const page = 2;
      const foo = 3;
      const bar = 5;
      const params = { page, foo, bar };
      const expected = `${EH_URL}/?page=${page}&foo=${foo}&bar=${bar}`;
      const actual = constructRequestUrl(params);

      expect(actual).toBe(expected);
    });

    it('returns base url if no params provided', () => {
      expect(constructRequestUrl()).toBe(EH_URL);
    });
  });

  describe('getGalleryTags & getRandomGalleryLink', () => {
    const tagsLen = 5;
    const gs = times(() => times(() => random(1, 10000), 2), tagsLen);
    const tags = map(([gid, token]) => `
      <a href="${EH_URL}/g/${gid}/${token}">gallery ${gid}</a>
    `, gs).join('\n');
    const html = `
      <div>
        <div>
          ${tags}
        </div>
      </div>
    `;
    const $ = cheerio.load(html);
    const gtags = getGalleryTags($);

    expect(gtags).toHaveLength(tagsLen);

    const url = getRandomGalleryLink($);
    const regex = new RegExp(`${EH_URL}/g/\\d+/\\d+$`);
    expect(url).toMatch(regex);
  });
});
