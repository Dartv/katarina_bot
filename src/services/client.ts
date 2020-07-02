import { Client as DiskatClient, ClientOptions, CommandConfigurator } from 'diskat';
import { Signale } from 'signale';
import { Collection } from 'discord.js';

import { logger } from './logger';
import * as Commands from '../commands';

export class Client extends DiskatClient {
  logger: Signale;
  plugins: Collection<string, any> = new Collection();

  constructor(options: ClientOptions) {
    super(options);

    this.logger = logger;

    Object.values(Commands).forEach((command: CommandConfigurator) => {
      this.commands.add(command);
    });

    this.once('ready', () => {
      this.plugins.forEach((plugin) => {
        plugin(this);
      });
    });
  }
}
