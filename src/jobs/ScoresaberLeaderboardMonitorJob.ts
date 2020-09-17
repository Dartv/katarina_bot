import { Constants, MessageEmbed, TextChannel } from 'discord.js';
import { readFile, writeFile } from 'fs';
import puppeteer from 'puppeteer';
import { promisify } from 'util';
import path from 'path';

import { Job } from '../types';
import { diff } from '../utils/common';

interface Player {
  id: string;
  name: string;
  pp: number | string;
  avatarUrl: string;
  country: string;
  rank: number | string;
}

const JOB_NAME = 'scoresaber leaderboard monitor';
const CHANNEL_ID = '620373848801411082';
const LEADERBOARD_URL = 'https://scoresaber.com/global?country=AM,AZ,BY,KG,KZ,MD,RU,TJ,UA,UZ';
const LEADERBOARD_PATH = path.join(process.cwd(), 'leaderboard.json');

const writeFileAsync = promisify(writeFile);
const readFileAsync = promisify(readFile);

const getLeaderboard = async () => {
  try {
    const leaderboard = await readFileAsync(LEADERBOARD_PATH, 'utf8');
    return JSON.parse(leaderboard);
  } catch (err) {
    return [];
  }
};

export const ScoresaberLeaderboardMonitorJob: Job = (agenda, client) => {
  agenda.define(JOB_NAME, async (job, done) => {
    let browser: puppeteer.Browser;

    try {
      const leaderboard: Player[] = await getLeaderboard();

      browser = await puppeteer.launch({
        args: ['--disable-gpu', '--no-sandbox', '--single-process', '--no-zygote'],
      });

      const page = await browser.newPage();

      await page.goto(LEADERBOARD_URL, {
        waitUntil: ['networkidle0', 'networkidle2', 'domcontentloaded'],
      });

      const players: Player[] = await page.$$eval(
        'table.ranking tbody tr',
        elems => [...elems].map((elem, i) => {
          const avatarUrl = elem.querySelector('td.picture')?.querySelector('img')?.src;
          const playerEl = elem.querySelector('td.player');
          const ppEl = elem.querySelector('td.pp');
          const id = playerEl?.querySelector('a')?.href?.match(/\/u\/(\d+)/)?.[1];
          const flagUrl = playerEl?.querySelector('img')?.src;
          const name = playerEl?.querySelector('.pp')?.textContent;
          const pp = +ppEl?.querySelector('.ppValue')?.textContent?.replace(',', '');

          return {
            id,
            name,
            pp,
            avatarUrl,
            country: flagUrl.match(/\/flags\/(.+)\.png/)?.[1],
            rank: i + 1,
          };
        }),
      );

      await writeFileAsync(LEADERBOARD_PATH, JSON.stringify(players), 'utf8');

      // skip on first run
      if (!leaderboard.length) {
        return;
      }

      const { added, removed } = diff(
        players,
        leaderboard,
        (a, b) => a.id === b.id && a.rank === b.rank,
      );

      const changes = added.map((current) => {
        const mock: Player = {
          id: current.id,
          name: current.name,
          rank: '?',
          pp: '?',
          avatarUrl: current.avatarUrl,
          country: current.country,
        };
        const previous = removed.find(prev => prev.id === current.id) || mock;

        return [previous, current];
      });

      if (changes.length) {
        const embed = new MessageEmbed()
          .setTitle('📈 Leaderboard changed')
          .setColor(Constants.Colors.BLUE)
          .addField(
            'Player',
            changes.map(([, curr]) => `:flag_${curr.country}: ${curr.name}`),
            true,
          )
          .addField(
            'Rank',
            changes.map(([prev, curr]) => `${prev.rank} -> ${curr.rank}`),
            true,
          )
          .addField(
            'pp',
            changes.map(([prev, curr]) => `${prev.pp} -> ${curr.pp}`),
            true,
          );
        const channel = client.channels.cache.get(CHANNEL_ID) as TextChannel;

        await channel.send(embed);
      }

      done();
    } catch (err) {
      job.fail(err);
      await job.save();
      done(err);
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  });

  agenda.every('30 minutes', JOB_NAME);
};
