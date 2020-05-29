/* global document, window */

import puppeteer, { Browser } from 'puppeteer';
import { pluck } from 'ramda';
import { ICommandHandler } from 'ghastly';

import { getCharacterStarRating } from '../../models/character/util';
import { Series, Character } from '../../models';
import { ISeries } from '../../models/series/types';
import { ICharacter } from '../../models/character/types';

let browser: Browser;

export const rollNormalBanner: ICommandHandler = async (): Promise<ICharacter> => {
  if (!browser) {
    browser = await puppeteer.launch();
  }

  const page = await browser.newPage();

  try {
    await page.setCookie({
      name: 'waifutheme',
      value: 'dark',
      domain: '.mywaifulist.moe',
    });
    await page.goto(
      'https://mywaifulist.moe/random',
      {
        waitUntil: ['networkidle0', 'networkidle2', 'domcontentloaded', 'load'],
      },
    );
    await page.waitFor('.waifu-core-container');
    const popularity = await page.$eval(
      '#popularity-rank',
      el => el.textContent.match(/\d+/)?.[0]
    ).then(Number);
    const name = await page.$eval('#waifu-name', el => el.textContent);
    const description = await page.$eval('#description', el => el.textContent);
    const series = await page.$$eval(
      'a.tooltip-target',
      els => [...els]
        .filter(el => el.getAttribute('href')?.startsWith('/series'))
        .map(el => ({
          title: el.textContent,
          slug: el.getAttribute('href').split('/')[2],
        })),
    );
    const imageUrl = await page.evaluate(() => {
      const el = document.querySelector('.bg-cover');
      const style = window.getComputedStyle(el);
      return style.backgroundImage?.slice(4, -1).replace(/["']/g, '');
    });
    const url = page.url();
    const slug = url.substring(url.lastIndexOf('/') + 1);
    const stars = getCharacterStarRating(popularity);
    // await page.evaluate((emoji) => {
    //   const el = document.createElement('div');
    //   const waifuEl = document.querySelector('.waifu-core-container');
    //   const waifuNameEl = document.querySelector('#waifu-name');
    //   const descriptionEl = document.querySelector('#description');
    //   const starsEl = document.createElement('div');
    //   const topBox = document.createElement('div');
    //   topBox.setAttribute(
    //     'style',
    //     'display: flex; justify-content: space-between; align-items: center; margin: 0 10px;'
    //   );
    //   starsEl.innerText = emoji;
    //   starsEl.setAttribute('style', 'color: yellow; font-size: 2em;');
    //   topBox.appendChild(waifuNameEl);
    //   topBox.appendChild(starsEl);
    //   waifuEl.querySelector('.waifu-score-tilted').remove();
    //   waifuEl.querySelector('#popularity-rank').parentElement.parentElement.parentElement.remove();
    //   descriptionEl.parentElement.removeChild(descriptionEl.parentElement.lastChild);
    //   el.appendChild(topBox);
    //   el.appendChild(waifuEl);
    //   waifuNameEl.insertAdjacentElement('afterend', starsEl);
    //   el.setAttribute('id', 'waifu-container');
    //   document.body.prepend(el);
    // }, Emoji.STAR.repeat(stars));

    const characterSeries = await Series.getUpdatedSeries(series as ISeries[]);
    const character = await Character.findOneAndUpdate(
      { slug },
      {
        $set: {
          name,
          description,
          stars,
          imageUrl,
          slug,
          popularity,
          series: pluck('_id', characterSeries),
        },
      },
      { upsert: true, new: true },
    ).populate('series');

    return character;
  } finally {
    await page.close();
  }
};
