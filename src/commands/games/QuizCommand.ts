import { Types } from 'mongoose';
import { Command } from 'diskat';
import { compareTwoStrings } from 'string-similarity';
import { Message } from 'discord.js';

import {
  UserDocument,
  SeriesDocument,
  WithInMemoryCooldownContext,
} from '../../types';
import { Trigger, MissionCode, CommandGroupName } from '../../utils/constants';
import { injectUser, withInMemoryCooldown } from '../middleware';
import { Character } from '../../models';
import { createCharacterEmbed, getCharacterStarRating } from '../../utils/character';

interface QuizCommandContext extends WithInMemoryCooldownContext {
  user: UserDocument;
}

const SIMILARITY_THRESHOLD = 0.8;
const isSimilarEnough = (a: string, b: string): boolean => compareTwoStrings(a, b) >= SIMILARITY_THRESHOLD;
const GUESS_REWARD = 10;

const QuizCommand: Command<QuizCommandContext> = async (context) => {
  const { message, user } = context;
  const [character] = await Character.random(1, [
    {
      $match: {
        series: {
          $ne: [],
        },
      },
    },
  ]);
  const embed = createCharacterEmbed({
    ...character.toObject(),
    series: [],
  });
  await message.channel.send('', { embed });
  const series = (character.series as Types.DocumentArray<SeriesDocument>).flatMap(
    ({ title }) => title.toLowerCase().split(' '),
  ).filter(title => title.length > 2);
  try {
    const answer = await message.channel.awaitMessages(
      ({ content }: Message) => {
        const guess = content.trim().toLowerCase();
        return series.some(title => isSimilarEnough(title, guess));
      },
      {
        max: 1,
        time: 15000,
        errors: ['time'],
      },
    ).then(messages => messages.first());

    if (answer) {
      user.correctQuizGuesses += 1;
      user.currency += GUESS_REWARD;
      await user.save();
      return answer.reply(
        `Congratulations! Your guess was correct.\nYou received ${GUESS_REWARD} 💎`,
        {
          embed: createCharacterEmbed({
            ...character.toObject(),
            stars: getCharacterStarRating(character.popularity),
          }),
        },
      );
    }

    throw new Error('');
  } catch (err) {
    return message.channel.send('No correct answers...', {
      embed: createCharacterEmbed({
        ...character.toObject(),
        stars: getCharacterStarRating(character.popularity),
      }),
    });
  }
};

QuizCommand.config = {
  triggers: Trigger.QUIZ,
  description: 'Guess the series by character',
  group: CommandGroupName.GAMES,
  middleware: [
    withInMemoryCooldown(async () => ({
      max: 1,
      window: 15,
      userId: 'quiz',
    })),
    injectUser(),
    async (next, context: QuizCommandContext) => {
      const result = await next(context);

      context.cooldowns.delete(context.message.author.id);
      context.client.emitter.emit('mission', MissionCode.QUIZ_DAILY, result, context);

      return result;
    },
  ],
};

export default QuizCommand;
