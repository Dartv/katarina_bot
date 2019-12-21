/* global document, window */

import { Attachment } from 'discord.js';
import puppeteer from 'puppeteer';
import fs from 'fs';
import { promisify } from 'util';
// import { isThisHour, differenceInMinutes } from 'date-fns';
import { tmpdir } from 'os';
import { pluck } from 'ramda';

import { COMMAND_TRIGGERS, Emoji } from '../util';
import { Character, User, Series } from '../models';
import { ErrorResponse } from './responses/ErrorResponse';
import { injectUser } from './middleware';
import { getCharacterStarRating } from '../models/character/util';

const unlink = promisify(fs.unlink);

// const checkRollCooldown = async (next, context) => {
//   if (isThisHour(context.user.lastRolledAt)) {
//     const diff = differenceInMinutes(new Date(), context.user.lastRolledAt);
//     return new ErrorResponse(`Your next roll is available in ${60 - diff} minutes`, context);
//   }
//   return next(context);
// };

const middleware = [
  injectUser(),
  // checkRollCooldown,
];

const handler = async (context): Promise<any> => {
  const browser = await puppeteer.launch();
  try {
    const { message } = context;

    const page = await browser.newPage();
    await page.setCookie({
      name: 'waifutheme',
      value: 'dark',
      domain: '.mywaifulist.moe',
    });
    await page.goto('https://mywaifulist.moe/random', { waitUntil: 'networkidle0' });
    await page.waitFor('.waifu-core-container');
    const popularity = await page.$eval(
      '#popularity-rank',
      el => el.textContent.match(/\d+/)?.[0]
    ).then(Number);
    const name = await page.$eval('#waifu-name', el => el.textContent);
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
    await page.evaluate((emoji) => {
      const el = document.createElement('div');
      const waifuEl = document.querySelector('.waifu-core-container');
      const waifuNameEl = document.querySelector('#waifu-name');
      const descriptionEl = document.querySelector('#description');
      const starsEl = document.createElement('div');
      const topBox = document.createElement('div');
      topBox.setAttribute(
        'style',
        'display: flex; justify-content: space-between; align-items: center; margin: 0 10px;'
      );
      starsEl.innerText = emoji;
      starsEl.setAttribute('style', 'color: yellow; font-size: 2em;');
      topBox.appendChild(waifuNameEl);
      topBox.appendChild(starsEl);
      waifuEl.querySelector('.waifu-score-tilted').remove();
      waifuEl.querySelector('#popularity-rank').parentElement.parentElement.parentElement.remove();
      descriptionEl.parentElement.removeChild(descriptionEl.parentElement.lastChild);
      el.appendChild(topBox);
      el.appendChild(waifuEl);
      waifuNameEl.insertAdjacentElement('afterend', starsEl);
      el.setAttribute('id', 'waifu-container');
      document.body.prepend(el);
    }, Emoji.STAR.repeat(stars));
    const container = await page.$('#waifu-container');
    const fileName = `${slug}.png`;
    const path = `${tmpdir()}/${fileName}`;
    const attachment = new Attachment(path, `${fileName}`);

    await container.screenshot({ path });

    const [
      { attachments },
      characterSeries,
    ] = await Promise.all([
      message.reply(name, attachment),
      (Series as any).getUpdatedSeries(series),
    ]);

    const [character] = await Promise.all([
      Character.findOneAndUpdate({ slug }, {
        $set: {
          name,
          stars,
          imageUrl,
          slug,
          series: pluck('_id', characterSeries as any[]),
          popularity,
          cardImageUrl: attachments.first().url,
        },
      }, { upsert: true, new: true }),
      unlink(path),
    ]);

    await User.findByIdAndUpdate(context.user.id, {
      $push: {
        characters: character._id,
      },
      $set: {
        lastRolledAt: new Date(),
      },
    });

    return null;
  } catch (err) {
    console.error(err);
    return new ErrorResponse('Couldn\'t roll waifu...', context);
  } finally {
    await browser.close();
  }
};

export default () => ({
  middleware,
  handler,
  triggers: COMMAND_TRIGGERS.ROLL,
  description: 'Waifu gacha game',
});
