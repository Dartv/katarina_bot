import { Constants } from 'discord.js';
import path from 'path';
import { tmpdir } from 'os';

export const COLORS = {
  INFO: Constants.Colors.BLUE,
  ERROR: Constants.Colors.DARK_RED,
  SUCCESS: Constants.Colors.GREEN,
  BLACK: '#000000',
  WHITE: '#ffffff',
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
  JOIN: ['join'],
  PLAY: ['play'],
};

export const FONTS = {
  HELVETICA: 'Helvetica',
  ttf: font => `${font}.ttf`,
};

export const DIRECTIONS = {
  NORTH: 'North',
};

export const TMP_IMAGE_PATH = path.resolve(tmpdir(), '../tmp.png');
