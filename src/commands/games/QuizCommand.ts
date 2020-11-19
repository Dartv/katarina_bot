import { Types } from 'mongoose';
import { Command } from 'diskat';
import { compareTwoStrings } from 'string-similarity';
import { Message } from 'discord.js';

import {
  UserDocument,
  SeriesDocument,
  WithInMemoryCooldownContext,
} from '../../types';
import {
  Trigger,
  MissionCode,
  CommandGroupName,
  QUIZ_GUESS_CURRENCY,
} from '../../utils/constants';
import { injectUser, withInMemoryCooldown } from '../middleware';
import { Character, User } from '../../models';
import { createCharacterEmbed, getCharacterStarRating } from '../../utils/character';

interface QuizCommandContext extends WithInMemoryCooldownContext {
  user: UserDocument;
}

const SIMILARITY_THRESHOLD = 0.8;
const isSimilarEnough = (a: string, b: string): boolean => compareTwoStrings(a, b) >= SIMILARITY_THRESHOLD;

const QuizCommand: Command<QuizCommandContext> = async (context) => {
  const { message } = context;
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
  }).setDescription('');
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
      const user = await User.register(answer.author);

      user.correctQuizGuesses += 1;
      user.currency += QUIZ_GUESS_CURRENCY;

      await user.save();

      context.client.emitter.emit(
        'mission',
        MissionCode.QUIZ_DAILY,
        null,
        // reassign user since the one who answered could be a different user
        {
          ...context,
          user,
          message: answer,
        },
      );

      return answer.reply(
        `Congratulations! Your guess was correct.\nYou received ${QUIZ_GUESS_CURRENCY} 💎`,
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
    withInMemoryCooldown(async ({ message }) => ({
      max: 1,
      window: 15,
      userId: message.guild.id,
    })),
    injectUser(),
    async (next, context: QuizCommandContext) => {
      const result = await next(context);

      context.cooldowns.delete(context.message.guild.id);

      return result;
    },
  ],
};

export default QuizCommand;
