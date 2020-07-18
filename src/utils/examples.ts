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
    case Trigger.ROLL[0]:
      return [
        '',
        'local',
      ];
    case Trigger.SEARCH[0]:
      return [
        '',
        'John Doe',
        'John Doe --series "Animal Crossing" --stars 5 --page 2 --favorites',
      ];
    case Trigger.BANNER[0]:
      return [''];
    case Trigger.BALANCE[0]:
      return [''];
    case Trigger.FAV[0]:
      return [
        'add aya-nanase',
        'remove aya-nanase',
      ];
    case Trigger.SET_WAIFU[0]:
      return [
        'kaori-miyazono-your-lie-in-april',
      ];
    default:
      return [];
  }
};
