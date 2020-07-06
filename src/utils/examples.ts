import { Client } from '../services/client';
import { Trigger } from './constants';

export const getExamplesByCommand = (commandName: string, client: Client): string[] => {
  switch (commandName) {
    case Trigger.GAY[0]:
      return ['@user'];
    case Trigger.HELP[0]:
      return [
        '',
        client.commands.random().name,
      ];
    default:
      return [];
  }
};
