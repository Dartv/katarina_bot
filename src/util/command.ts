import { ICommandContext } from 'ghastly';

// TODO: handle aliases
export const extractCommandFromContext = (context: ICommandContext): string => {
  const { prefix } = context.client.dispatcher;
  const regex = new RegExp(`^${prefix}(.+) ?`);
  return context.message.content.match(regex)?.[1] || '';
};
