import { Client } from 'ghastly';
import { ChatbotPlugin } from './ChatbotPlugin';
import { ReactionPersistPlugin } from './ReactionPersistPlugin';
import { WallOfShamePlugin } from './WallOfShamePlugin';
import { VersusMissionPlugin } from './VersusMissionPlugin';

export const installPlugins = (client: Client): void => {
  const plugins = [
    ChatbotPlugin,
    ReactionPersistPlugin,
    WallOfShamePlugin,
    VersusMissionPlugin,
  ];

  plugins.forEach((plugin) => {
    plugin(client);
  });
};
