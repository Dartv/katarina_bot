/* eslint-disable max-classes-per-file */

declare module 'ghastly' {
  export class Client {
    constructor(...args: any[])

    [key: string]: any;
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
    message: Message;
    formatter: ICommandFormatter;
    user?: any;
    guild?: any;
    error?: Error;
    command?: string;
    dispatch: (...args: any[]) => Promise<any>;
    args: { [key: string]: any };
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
