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
  DICE: ['dice'],
  PROTECC: ['protecc'],
  HANDHOLDING: ['handholding'],
  AWOO: ['awoo'],
  DISGUST: ['disgust'],
  SMUG: ['smug'],
  PANTSU: ['pantsu'],
  VISIT: ['visit'],
  CALC_SCORE: ['calcscore', 'cs'],
  ADD_PLAYER: ['addplayer'],
  CRINGE: ['cringe'],
  WALL_OF_SHAME: ['wallofshame'],
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
  COOL_CHAMP = '<:CoolChamp:685274406829817945>',
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

export enum Banner {
  NORMAL = 'normal',
  LOCAL = 'local',
}

export const EXPToLVLUp = [
  0,
  100,
  300,
  600,
  1000,
  1500,
  2100,
  2800,
  3600,
  4500,
  5500,
  6600,
  7800,
  9100,
  10500,
  12000,
  13600,
  15300,
  17100,
  19000,
  21000,
  23100,
  25300,
  27600,
  30000,
  32500,
  35100,
  37800,
  40600,
  43500,
  46500,
  49600,
  52800,
  56100,
  59500,
  63000,
  66600,
  70300,
  74100,
  78000,
  82000,
  86100,
  90300,
  94600,
  99000,
  103500,
  108100,
  112800,
  117600,
  122500,
  127500,
  132600,
  137800,
  143100,
  148500,
  154000,
  159600,
  165300,
  171100,
  177000,
];

export enum HTTPMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
}
