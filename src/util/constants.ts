import Constants from 'discord.js/src/util/Constants';
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
  STOP: ['stop'],
  SKIP: ['skip'],
  PAUSE: ['pause'],
  RESUME: ['resume'],
  EH: ['eh'],
  DANBOORU: ['danbooru'],
  ROLL: ['roll'],
  MYWAIFUS: ['mywaifus', 'mws'],
  MYWAIFU: ['mywaifu', 'mw'],
  ADDFAV: ['addfav'],
  DELFAV: ['delfav'],
  FAVS: ['favs'],
  VERSUS: ['versus'],
  WHOIS: ['whois', 'wis'],
  WHATSERIES: ['whatseries', 'whs'],
  STEAL_WAIFU: ['stealwaifu', 'sw'],
  LOVE: ['love'],
  GAY: ['gay'],
  PROFILE: ['profile'],
  SET_WAIFU: ['setwaifu'],
  SET_QUOTE: ['setquote'],
  BUILD_DECK: ['builddeck'],
  DECK: ['deck'],
  MARRY: ['marry'],
  DIVORCE: ['divorce'],
  SUDOKU: ['sudoku'],
  RESURRECT: ['resurrect'],
  LIAR: ['liar'],
};

export const FONTS = {
  HELVETICA: 'Helvetica',
  ttf: font => `${font}.ttf`,
};

export const DIRECTIONS = {
  NORTH: 'North',
};

export const TMP_IMAGE_PATH = path.resolve(tmpdir(), '../tmp.png');

export const YT_VIDEO_CHOICE_TIME = 15 * 1000;

export const ERRORS = {
  VC_NOT_FOUND: 'I\'m not in a voice channel',
  VC_ALREADY_IN: 'I\'m already in your voice channel',
  VC_NOT_JOINABLE: 'I\'m not allowed to join your voice channel',
  VC_NOT_SPEAKABLE: 'I\'m not allowed to speak in your voice channel',
  VC_NOT_PLAYING: 'I\'m not playing anything right now',
  VC_ALREADY_PLAYING: 'I\'m already playing right now',
  VC_UNABLE_TO_JOIN: 'Unable to join a voice channel. Please, try again!',
  YT_ALREADY_QUEUED: 'This video is already queued',
  YT_COULD_NOT_DISPLAY_SEARCH_RESULTS: 'Cannot display a list of search results',
  YT_NO_CHOICE: 'You didn\'t specify a video to play',
  YT_NOT_FOUND: 'Requested video not found',
  CMD_CD: 'This command is on the cooldown... Please, wait for a few seconds.',
};

export const {
  EH_URL,
  EH_API_URL,
} = process.env;
export const EH_HTML_PATH = path.join(tmpdir(), 'eh.html');

export const BOT_PREFIXES = [
  '!',
  '$',
  '%',
  '^',
  '&',
  '*',
  '|',
  ',',
  '.',
  '=',
  '?',
];

export enum CharacterStar {
  ONE_STAR = 1,
  TWO_STAR,
  THREE_STAR,
  FOUR_STAR,
  FIVE_STAR,
}

export enum Emoji {
  STAR = '⭐️',
  LIAR = '<:pizdabol:558647131334901764>',
  SPRAVEDLIVO = '<:spravedlivo:586138243855155200>',
}

export enum PopularityThreshold {
  TWO_STAR = Infinity,
  THREE_STAR = 10000,
  FOUR_STAR = 3000,
  FIVE_STAR = 300,
}

export const DECK_LIMIT = 5;

export enum MarriageStatus {
  PROPOSED = 'PROPOSED',
  MARRIED = 'MARRIED',
}
