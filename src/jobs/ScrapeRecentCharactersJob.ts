import { Browser, launch } from 'puppeteer';

import { Job } from '../types';
import { MWL_BASE_URL } from '../utils/constants';
import { rollExternalCharacter } from '../utils/roll';

const JOB_NAME = 'SCRAPE_RECENT_CHARACTERS';

export const ScrapeRecentCharactersJob: Job = (agenda, client) => {
  agenda.define(JOB_NAME, async (job, done) => {
    let browser: Browser;

    try {
      browser = await launch({
        args: ['--disable-gpu', '--no-sandbox'],
      });
      const page = await browser.newPage();
      await page.goto(`${MWL_BASE_URL}/browse`, {
        waitUntil: ['networkidle0', 'networkidle2', 'domcontentloaded'],
      });
      const paths = await page.$$eval(
        '.list-reset > div',
        els => [...els]
          .map(el => el.querySelector('a')?.getAttribute('href'))
          .filter(Boolean),
      );

      await paths.reduce(async (prev, path) => {
        try {
          await prev;
        } catch (err) {
          client.logger.error(`Failed to fetch ${path}`);
          client.logger.error(err);
        }

        return rollExternalCharacter(`${MWL_BASE_URL}${path}`);
      }, Promise.resolve(null));

      done();
    } catch (err) {
      job.fail(err);
      await job.save();
      done(err);
    } finally {
      if (browser) {
        browser.close().catch(client.logger.error);
      }
    }
  });

  // agenda.every('0 * * * *', JOB_NAME);
};
