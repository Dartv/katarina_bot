/* global document, window */

import { Attachment } from 'discord.js';
import puppeteer from 'puppeteer';
import fs from 'fs';
import { promisify } from 'util';
import { isThisHour, differenceInMinutes } from 'date-fns';
import { tmpdir } from 'os';

import { COMMAND_TRIGGERS, CharacterStar, Emoji } from '../util';
import { Character, User } from '../models';
import { ErrorResponse } from './responses/ErrorResponse';
import { injectUser } from './middleware';

const unlink = promisify(fs.unlink);

const getStarRating = (popularity: number): CharacterStar => {
  if (popularity <= 500) return CharacterStar.FIVE_STAR;
  if (popularity <= 3000) return CharacterStar.FOUR_STAR;
  if (popularity <= 10000) return CharacterStar.THREE_STAR;
  return CharacterStar.TWO_STAR;
};

const checkRollCooldown = async (next, context) => {
  if (isThisHour(context.user.lastRolledAt)) {
    const diff = differenceInMinutes(new Date(), context.user.lastRolledAt);
    return new ErrorResponse(`Your next roll is available in ${60 - diff} minutes`, context);
  }
  return next(context);
};

const middleware = [
  injectUser(),
  // checkRollCooldown,
];

const handler = async (context): Promise<any> => {
  const browser = await puppeteer.launch();
  try {
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
    const stars = getStarRating(popularity);
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

    await context.message.reply('', attachment);

    const [character] = await Promise.all([
      Character.findOneAndUpdate({ slug }, {
        $set: {
          name,
          stars,
          imageUrl,
          slug,
          series,
          popularity,
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
  description: 'Anime waifu gacha',
});
