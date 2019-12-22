import { Message } from 'discord.js';

export type CommandParam = {
  name: string;
  description?: string;
  optional?: boolean;
  repeatable?: boolean;
  defaultValue?: any;
}

export interface ICommandFormatter {
  code(content: string): string;
}

export interface ICommandContext {
  message: Message;
  formatter: ICommandFormatter;
  user?: any;
  guild?: any;
}

export type ICommandHandler = (context: ICommandContext & Partial<any>) => Promise<any>;

export type Middleware = {
  (next: (context: ICommandContext) => any, context: ICommandContext): Promise<any>;
}

export interface ICommand {
  middleware?: Middleware[];
  handler: ICommandHandler;
  triggers: string[];
  description?: string;
  parameters?: [CommandParam];
}
