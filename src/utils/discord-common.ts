import {
  Message,
  AwaitMessagesOptions,
  User,
  TextBasedChannelFields,
  Channel,
  TextChannel,
} from 'discord.js';
import { DiscordLimit } from './constants';

export interface PromptUserOptions extends AwaitMessagesOptions {
  correct?: string[];
  incorrect?: string[];
}

export const resolveEmbedDescription = (
  description: string,
): string => description.slice(0, DiscordLimit.EMBED_DESCRIPTION - 3).concat('...');

export const awaitAnswer = async (
  user: User,
  channel: Channel & TextBasedChannelFields,
  {
    correct = [],
    incorrect = [],
    ...collectorOptions
  }: PromptUserOptions = {},
): Promise<{ message?: Message, error?: Error }> => {
  try {
    const answers = correct.concat(incorrect);
    const message = await channel.awaitMessages(
      ({ content, author }: Message) => answers.length ? (
        answers.includes(content.trim().toLowerCase()) && author.id === user.id
      ) : true,
      {
        max: 1,
        time: 10000,
        errors: ['time'],
        ...collectorOptions,
      },
    ).then(messages => messages.first());

    if (correct.includes(message.content.toLowerCase())) {
      return { message };
    }

    return {};
  } catch (error) {
    return { error };
  }
};

export const isTextChannel = (channel: Channel): channel is TextChannel => channel?.type === 'text';
