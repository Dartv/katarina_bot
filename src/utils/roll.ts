/* global document, window */

import puppeteer, { Browser } from 'puppeteer';

import { CharacterDocument, SeriesDocument } from '../types';
import { Character, Series } from '../models';
import { logger } from '../services/logger';
import { isDev } from './environment';

let browser: Browser;

export const rollLocalCharacter = async (): Promise<CharacterDocument> => {
  const [character] = await Character.random(1);
  return character;
};

export const getUpdatedSeries = async (series: { title: string, slug: string }[]): Promise<SeriesDocument[]> => {
  const promises = series.map(({ title, slug }) => Series.findOneAndUpdate(
    { slug },
    {
      $set: {
        title,
        slug,
      },
    },
    {
      upsert: true,
      new: true,
    },
  ));

  return Promise.all(promises);
};

const setupBrowser = async () => {
  browser = await puppeteer.launch({
    args: ['--disable-gpu', '--no-sandbox'],
  });

  logger.info(`Started Puppeteer with pid ${browser.process().pid}`);
};

export const rollExternalCharacter = async (): Promise<CharacterDocument> => {
  if (!browser) {
    await setupBrowser();
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
        waitUntil: ['networkidle0', 'networkidle2'],
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

    const characterSeries = await getUpdatedSeries(series);
    const character = await Character.findOneAndUpdate(
      { slug },
      {
        $set: {
          name,
          description,
          imageUrl,
          slug,
          popularity,
          series: characterSeries.map(({ _id }) => _id),
        },
      },
      { upsert: true, new: true },
    ).populate('series');

    return character;
  } finally {
    await page.close();
    if (isDev()) {
      await browser.close();
    }
  }
};
