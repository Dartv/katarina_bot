export type Middleware = {
  (next: (context: any) => any, context: any): Promise<any>;
}

export type CommandParam = {
  name: string;
  description?: string;
  optional?: boolean;
  repeatable?: boolean;
  defaultValue?: any;
}

export interface ICommand {
  middleware?: Middleware[];
  handler: (context: object) => Promise<any>;
  triggers: string[];
  description?: string;
  parameters?: [CommandParam];
}
