import { Message } from 'discord.js';
import { Client, ICommandContext } from 'ghastly';
import MarkdownFormatter from 'ghastly/lib/utils/MarkdownFormatter';
import { IUser } from '../models/user/types';

// TODO: handle aliases
export const extractCommandFromContext = (context: ICommandContext): string => {
  const { prefix } = context.client.dispatcher;
  const regex = new RegExp(`^${prefix}(.+) ?`);
  return context.message.content.match(regex)?.[1] || '';
};

export const createContext = ({
  user,
  message,
  client,
}: {
  user: IUser;
  message: Message;
  client: Client;
}): ICommandContext => {
  const context = {
    user,
    message,
    dispatch: (response) => client.dispatcher.dispatchResponse(message.channel, response),
    formatter: MarkdownFormatter,
  } as ICommandContext;

  return context;
};
