import { GuildSettingOption } from '../commands/guild/GuildSettingsCommand';
import { Client } from '../services/client';
import { Trigger, UserSettingName, UserSetting } from './constants';

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
        'John Doe --global',
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
    case Trigger.SET_QUOTE[0]:
      return [
        'People die when they are killed',
      ];
    case Trigger.DAILY[0]:
      return [''];
    case Trigger.DUEL[0]:
      return ['@user 100'];
    case Trigger.ATTACK[0]:
      return [''];
    case Trigger.ENTER[0]:
      return [''];
    case Trigger.QUIZ[0]:
      return [''];
    case Trigger.SETTINGS[0]:
      return [`${UserSettingName.DISPLAY_ROLL_PRICE} ${UserSetting.OFF}`];
    case Trigger.GUILD_SETTINGS[0]:
      return [`${GuildSettingOption.BOSS_CHANNEL} #world-boss`];
    default:
      return [];
  }
};
