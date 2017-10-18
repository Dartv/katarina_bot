import { Constants } from 'discord.js';

export const COLOR_INFO = Constants.Colors.BLUE;

export const COLOR_ERROR = Constants.Colors.DARK_RED;

export const COLOR_SUCCESS = Constants.Colors.GREEN;

export const COLOR_BLACK = '#000000';

export const COLOR_WHITE = '#ffffff';

export const COLORS = {
  INFO: COLOR_INFO,
  ERROR: COLOR_ERROR,
  SUCCESS: COLOR_SUCCESS,
  BLACK: COLOR_BLACK,
  WHITE: COLOR_WHITE,
};

export const COMMAND_TRIGGERS = {
  ADD: ['add', 'a'],
  ART: ['art'],
  EMOJIFY: ['emojify'],
  HELP: ['help'],
  LIST: ['list'],
  POST: ['post', 'p'],
  REMOVE: ['remove', 'r'],
  REMOVE_ALL: ['removeall', 'ra'],
  GUILD_ADD: ['gadd', 'ga'],
  GUILD_LIST: ['glist'],
  GUILD_POST: ['gpost', 'gp'],
  GUILD_REMOVE: ['gremove', 'gr'],
  WRITE: ['write', 'w'],
};

export const FONTS = {
  HELVETICA: 'Helvetica',
  ttf: font => `${font}.ttf`,
};

export const DIRECTIONS = {
  NORTH: 'North',
};
