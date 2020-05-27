/* eslint-disable max-classes-per-file */

declare module 'ghastly' {
  import { Client as DiscordClient, ClientOptions } from 'discord.js';

  export interface IClientOptions extends DiscordClientOptions {
    prefix?: string;
  }

  export class Client extends DiscordClient {
    services: any;

    prefix?: string;

    dispatcher: any;

    constructor(options: IClientOptions)
  }

  export type CommandParam = {
    name: string;
    description?: string;
    optional?: boolean;
    repeatable?: boolean;
    defaultValue?: any;
  }

  export interface ICommandContext {
    message: import('discord.js').Message;
    formatter: typeof import('ghastly/lib/utils/MarkdownFormatter');
    user?: any;
    guild?: any;
    error?: Error;
    command?: string;
    dispatch: (...args: any[]) => Promise<any>;
    args: { [key: string]: any };
    client: Client;
    models?: any;
    commands: { commands: Map<string, ICommand> };
  }

  export type ICommandHandler = (context: Partial<any> & ICommandContext) => Promise<any>;

  export type Middleware = {
    (next: (context: ICommandContext) => any, context: ICommandContext): Promise<any>;
  }

  export interface ICommand {
    name?: string;
    aliases?: string[];
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

declare module 'ghastly/lib/utils/MarkdownFormatter' {
  class MarkdownFormatter {
    static code(content: string): string;

    static bold(content: string): string;

    static italic(content: string): string;

    static strikeout(content: string): string;

    static underline(content: string): string;

    static codeBlock(content: string): string;
  }

  export = MarkdownFormatter;
}
