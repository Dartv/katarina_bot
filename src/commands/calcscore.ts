import { ICommand, ICommandHandler } from 'ghastly';
import fetch from 'node-fetch';
import cheerio from 'cheerio';
import * as R from 'lib-r-math.js';
import { GuildMember } from 'discord.js';

import { COMMAND_TRIGGERS, getHtml } from '../util';
import { ErrorResponse } from './responses';

const { Normal, Uniform } = R;

const { rnorm } = Normal();
const { runif } = Uniform();
const multipliers = [1, 1, 2, 2, 2, 2, 4, 4, 4, 4, 4, 4, 4, 4];

const getAccuracyRank = (accuracy: number): string => {
  if (accuracy >= 1) return 'SSS';
  if (accuracy >= 0.9) return 'SS';
  if (accuracy >= 0.8) return 'S';
  if (accuracy >= 0.65) return 'A';
  if (accuracy >= 0.5) return 'B';
  if (accuracy >= 0.35) return 'C';
  if (accuracy >= 0.20) return 'D';
  return 'E';
};

const getHitScoreByPP = (pp: number): number => {
  if (pp >= 10) return 107;
  if (pp >= 9) return 106;
  if (pp >= 8) return 105;
  if (pp >= 7) return 104;
  if (pp >= 6) return 103;
  if (pp >= 5) return 99;
  if (pp >= 4) return 98;
  if (pp >= 3) return 97;
  if (pp >= 2) return 92;
  if (pp >= 1) return 70;
  return 50;
};

const getMax = (ratio: number, n: number): number => {
  if (ratio >= 2) return 0;
  if (ratio >= 1.75) return 0.0075 * n;
  if (ratio >= 1.5) return 0.005 * n;
  if (ratio >= 1.25) return 0.0025 * n;
  if (ratio >= 1) return 0.01 * n;
  if (ratio >= 0.75) return 0.025 * n;
  if (ratio >= 0.5) return 0.05 * n;
  return n;
};

const generateHits = (n = 100, stars: number, pp: number): {
  hits: number[];
  misses: number[];
} => {
  const ratio = (pp || stars) / stars;
  const numbers: number[] = rnorm(n, getHitScoreByPP(pp), 3).map(Math.ceil);
  const max = getMax(ratio, n);
  const misses: number[] = runif(
    Math.ceil(Math.abs(rnorm(1, max, max * 0.1))),
    1,
    n,
  ).map(Math.ceil);
  return {
    hits: numbers.map((number, i) => misses.includes(i) ? 0 : number),
    misses,
  };
};

const getTotalScore = (hits: number[]): number => {
  let multiplier = multipliers[0];
  let total = 0;
  let health = 50;
  let combo = 0;
  // eslint-disable-next-line
  for (let hit of hits) {
    if (health < 1) {
      return 0;
    }
    const score = hit * multiplier;
    total += score;
    if (hit === 0) {
      health -= 15;
      ([multiplier] = multipliers);
    } else {
      combo += 1;
      if (health < 100) {
        health += 1;
      } else {
        health = 100;
      }

      if (combo < 14) {
        multiplier = multipliers[combo];
      } else {
        multiplier = 8;
      }
    }
  }
  return total;
};

const getAccuracy = (hits: number[]): number => {
  const totalScore = getTotalScore(hits);
  const maximumPossibleScore = getTotalScore(new Array(hits.length).fill(null).map(() => 115));
  return totalScore / maximumPossibleScore;
};

const handler: ICommandHandler = async (context): Promise<any> => {
  const { args: { url }, message } = context;
  const { notes, title, stars } = await fetch(url)
    .then(getHtml)
    .then(cheerio.load.bind(cheerio))
    .then(($: CheerioStatic) => {
      const html = $('.content > .columns > .column .columns .column:last-child').html();
      const columns = html.split('\n').map(s => s.trim());
      const noteCount = columns
        .find(s => s.startsWith('Note Count:'))
        ?.match(/[\d,]+/g)
        ?.[0]
        ?.replace(',', '');
      const starDifficulty = columns
        .find(s => s.startsWith('Star Difficulty:'))
        ?.match(/\d+(\.\d+)?/g)
        ?.[0];
      return {
        title: $('h4.title > a').text(),
        notes: parseInt(noteCount, 10),
        stars: parseFloat(starDifficulty),
      };
    });

  if (!notes) {
    return ErrorResponse('Failed to parse beatmap', context);
  }

  const role = (message.member as GuildMember).roles.find((r) => /^\d+k$/g.test(r.name));
  const pp = parseInt(role.name.replace('k', ''), 10);
  const { hits, misses } = generateHits(notes, stars, pp);
  const accuracy = getAccuracy(hits);
  const accuracyRank = getAccuracyRank(accuracy);
  const msg = `Your accuracy for ${title} is ${(accuracy * 100).toFixed(2)}% ${accuracyRank} (${misses.length} misses)`;
  await message.reply(msg);
  return null;
};

export default (): ICommand => ({
  handler,
  triggers: COMMAND_TRIGGERS.CALC_SCORE,
  description: 'Calculates beatmap score',
  parameters: [
    {
      name: 'url',
      description: 'beatmap link',
    },
  ],
});
