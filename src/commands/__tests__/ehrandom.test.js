// import { handler } from '../ehrandom';
import fetch from 'node-fetch';
import cheerio from 'cheerio';
import { writeFile, access, constants, readFile } from 'mz/fs';
import { tmpdir } from 'os';
import { join } from 'path';
import random from 'random-int';
// import { times, all, gt, compose, length, filter, equals } from 'ramda';

import { EH_URL } from '../../util/constants';

const HTML_FILE_PATH = join(tmpdir(), 'eh.html');

describe('ehrandom', () => {
  const get$ = async () => {
    const html = await readFile(HTML_FILE_PATH, 'utf8');
    return cheerio.load(html);
  };

  beforeEach(async () => {
    try {
      await access(HTML_FILE_PATH, constants.R_OK);
      return;
    } catch (err) {
      console.log(`Writing to ${HTML_FILE_PATH}`);
    }

    try {
      const res = await fetch(EH_URL);
      const html = await res.text();
      await writeFile(HTML_FILE_PATH, html, 'utf8');
    } catch (err) {
      throw err;
    }
  });

  it('gets last page', async () => {
    const $ = await get$();
    const lastPage = +$('.ptt')
      .find('td')
      .last()
      .prev()
      .text();
    expect(NaN).not.toBe(expect.any(Number));
    expect(lastPage).toEqual(expect.any(Number));
  });

  it('gets href to a random gallery', async () => {
    try {
      const $ = await get$();
      const tags = $(`a[href*="${EH_URL}/g/"]`);
      const idx = random(tags.length - 1);
      const tag = tags[idx];
      expect($(tag).attr('href')).toEqual(expect.any(String));
    } catch (err) {
      throw err;
    }
  });

  it('gets random image', async () => {
    // try {
    //   await fetch(EH_URL, {
    //     method: 'POST',
    //     headers: {
    //       'Content-Type': 'application/json',
    //     },
    //     body: JSON.stringify({
    //       method: 'gdata',
    //       gidlist: [
    //           [618395, '0439fa3666'],
    //       ],
    //       namespace: 1,
    //     }),
    //   });
    // } catch (err) {
    //   throw err;
    // }

    // try {
    //   let $ = await get$();
    //   let tags = $(`a[href*="${EH_URL}/g/"]`);
    //   let idx = random(tags.length - 1);
    //   let tag = tags[idx];
    //   let res = await fetch($(tag).attr('href'));
    //   let html = await res.text();
    //   $ = cheerio.load(html);
    //   tags = $(`a[href*="${EH_URL}/s/"]`);
    //   idx = random(tags.length - 1);
    //   tag = tags[idx];
    //   res = await fetch($(tag).attr('href'));
    //   html = await res.text();
    //   $ = cheerio.load(html);
    //   const image = $('#img');
    //   const src = image.attr('src');
    //   expect(src).toEqual(expect.any(String));
    // } catch (err) {
    //   throw err;
    // }
  });
});
