import { Client } from '../services/client';
import { Trigger } from './constants';

export const getExamplesByCommand = (commandName: string, client: Client): string[] => {
  switch (commandName) {
    case Trigger.HELP[0]:
      return [
        '',
        client.commands.random().name,
      ];
    case Trigger.GAY[0]:
      return ['@user'];
    case Trigger.LOVE[0]:
      return ['@user'];
    case Trigger.DICE[0]:
      return ['20'];
    case Trigger.LIAR[0]:
      return ['@user'];
    case Trigger.SUDOKU[0]:
      return [''];
    default:
      return [];
  }
};
