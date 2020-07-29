import { Types } from 'mongoose';
import { Command } from 'diskat';
import { compareTwoStrings } from 'string-similarity';
import { Message } from 'discord.js';

import {
  UserDocument,
  SeriesDocument,
  WithInMemoryCooldownContext,
} from '../../types';
import { Trigger, MissionCode } from '../../utils/constants';
import { injectUser, withInMemoryCooldown } from '../middleware';
import { Character } from '../../models';
import { createCharacterEmbed } from '../../utils/character';
import { ErrorResponse } from '../responses';

interface QuizCommandContext extends WithInMemoryCooldownContext {
  user: UserDocument;
}

const SIMILARITY_THRESHOLD = 0.8;
const isSimilarEnough = (a: string, b: string): boolean => compareTwoStrings(a, b) >= SIMILARITY_THRESHOLD;

const QuizCommand: Command<QuizCommandContext> = async (context): Promise<any> => {
  const { message } = context;
  const [character] = await Character.random(1);
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
      return answer.reply(
        'Congratulations! Your guess was correct',
        { embed: createCharacterEmbed(character.toObject()) },
      );
    }

    throw new Error('');
  } catch (err) {
    return new ErrorResponse(context, 'No correct answers...');
  }
};

QuizCommand.config = {
  triggers: Trigger.QUIZ,
  description: 'Guess the series by character',
  middleware: [
    withInMemoryCooldown(async ({ message }) => ({
      max: 1,
      window: 15,
      userId: message.author.id,
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
