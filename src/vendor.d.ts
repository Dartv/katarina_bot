/* eslint-disable max-classes-per-file */

declare module 'ghastly' {
  import { Client as DiscordClient, ClientOptions } from 'discord.js';

  export interface IClientOptions extends DiscordClientOptions {
    prefix?: string;
  }

  export class Client extends DiscordClient {
    services: any;

    prefix?: string;

    constructor(options: IClientOptions)
  }

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
    message: import('discord.js').Message;
    formatter: ICommandFormatter;
    user?: any;
    guild?: any;
    error?: Error;
    command?: string;
    dispatch: (...args: any[]) => Promise<any>;
    args: { [key: string]: any };
    client: import('discord.js').Client;
  }

  export type ICommandHandler = (context: Partial<any> & ICommandContext) => Promise<any>;

  export type Middleware = {
    (next: (context: ICommandContext) => any, context: ICommandContext): Promise<any>;
  }

  export interface ICommand {
    middleware?: Middleware[];
    handler: ICommandHandler;
    triggers: string[];
    description?: string;
    parameters?: CommandParam[];
  }
}

declare module 'ghastly/command' {
  class Response {
    private executor: () => Promise<any>;

    constructor(executor);

    respond(): Promise<any>;
  }

  class VoiceResponse {
    constructor(context: object, inputMethod: string, payload: any, options?: object);
  }
}
