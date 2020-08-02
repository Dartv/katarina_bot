import {
  Client as DiskatClient,
  ClientOptions,
  Command,
  expectGuild,
  TypedEventEmitter,
  Dispatcher,
} from 'diskat';
import { EventEmitter } from 'events';

import { logger } from './logger';
import * as Commands from '../commands';
import { CommandGroupName } from '../utils/constants';
import { Parameters } from '../commands/parameters';
import * as Plugins from '../plugins';
import { Plugin, Events } from '../types';
import { injectGuild } from '../commands/middleware';

export class Client extends DiskatClient {
  logger = logger;
  emitter = new EventEmitter() as TypedEventEmitter<Events>;
  dispatcher: Dispatcher<Client>;

  constructor(options: ClientOptions) {
    super(options);

    Object.entries(Parameters).forEach(([key, resolver]) => {
      this.types.set(key, resolver.bind(this.types));
    });

    Object.values(Commands).forEach((command: Command<any, unknown>) => {
      this.commands.add(() => command);
    });

    this.commands.applyGroupMiddleware(CommandGroupName.GACHA, [
      expectGuild(),
      injectGuild(),
    ]);

    this.commands.applyGroupMiddleware(CommandGroupName.GAMES, [
      expectGuild(),
      injectGuild(),
    ]);

    this.once('ready', () => {
      Object.values(Plugins).forEach((plugin: Plugin) => plugin(this));
    });
  }
}
