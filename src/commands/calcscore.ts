import { ICommand, ICommandHandler } from 'ghastly';
import fetch from 'node-fetch';
import cheerio from 'cheerio';
import * as R from 'lib-r-math.js';

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

const generateHits = (n = 100): number[] => {
  const numbers: number[] = rnorm(n, 109, 3).map(Math.ceil);
  const misses: number[] = runif(Math.ceil(runif(1, 0, n / 100)), 1, n).map(Math.floor);
  return numbers.map((number, i) => misses.includes(i) ? 0 : number);
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
  const { args: { url } } = context;
  const { notes, title } = await fetch(url)
    .then(getHtml)
    .then(cheerio.load.bind(cheerio))
    .then(($: CheerioStatic) => {
      const html = $('.content > .columns > .column .columns .column:last-child').html();
      const match = html
        .split('\n')
        .map(s => s.trim())
        .find(s => s.startsWith('Note Count:'))
        ?.match(/[\d,]+/g)
        ?.[0]
        ?.replace(',', '');
      return {
        title: $('h4.title > a').text(),
        notes: parseInt(match, 10),
      };
    });

  if (!notes) {
    return ErrorResponse('Failed to parse beatmap', context);
  }

  const hits = generateHits(notes);
  const accuracy = getAccuracy(hits);
  const accuracyRank = getAccuracyRank(accuracy);
  return `Your accuracy for ${title} is ${(accuracy * 100).toFixed(2)}% ${accuracyRank}`;
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
