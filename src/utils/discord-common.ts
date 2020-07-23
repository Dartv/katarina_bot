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
): Promise<Message | undefined> => {
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

    if (!message) {
      return undefined;
    }

    if (correct.includes(message.content.toLowerCase())) {
      return message;
    }

    return undefined;
  } catch (err) {
    return undefined;
  }
};

export const isTextChannel = (channel: Channel): channel is TextChannel => channel.type === 'text';
