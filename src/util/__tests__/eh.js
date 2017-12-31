import cheerio from 'cheerio';

import { getLastPage, constructRequestUrl } from '../eh';
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
});
