import puppeteer from 'puppeteer';
import { pluck } from 'ramda';
import { expectUser } from 'ghastly/lib/middleware';

import { Character, Series } from '../models';
import { ErrorResponse } from './responses/ErrorResponse';
import { injectUser } from './middleware';

const middleware = [
  injectUser(),
  expectUser(process.env.SUPER_ADMIN_ID),
];

const handler = async (context): Promise<any> => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  try {
    const stream = await Character.find({}, { name: 1, slug: 1 }).cursor();
    await new Promise((resolve) => {
      const queue = [];
      stream.on('data', (character) => {
        queue.push(async () => {
          try {
            console.log(`Processing character ${character.name}...`);
            await page.goto(`https://mywaifulist.moe/waifu/${character.slug}`);
            await page.waitFor('a.tooltip-target');
            const series = await page.$$eval(
              'a.tooltip-target',
              els => [...els]
                .filter(el => el.getAttribute('href')?.startsWith('/series'))
                .map(el => ({
                  title: el.textContent,
                  slug: el.getAttribute('href').split('/')[2],
                })),
            );
            const characterSeries = await (Series as any).getUpdatedSeries(series);
            await Character.findByIdAndUpdate(character.id, {
              $set: {
                series: pluck('_id', characterSeries as any[]),
              },
            });
          } catch (err) {
            console.log(`Couldn't fetch waifu ${character.name}`);
          }
        });
      });
      stream.on('end', async () => {
        await queue.reduce(
          (prev, next) => prev.then(next).catch((err) => {
            console.error(err);
            return next();
          }),
          Promise.resolve(),
        );
        await browser.close();
        console.log('Finished...');
        resolve();
      });
    });
    return null;
  } catch (err) {
    console.error(err);
    await browser.close();
    return new ErrorResponse('Couldn\'t scrape waifus...', context);
  }
};

export default () => ({
  middleware,
  handler,
  triggers: ['scrape'],
  description: '',
});
