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
  STOP: ['stop'],
  SKIP: ['skip'],
  PAUSE: ['pause'],
  RESUME: ['resume'],
  EHRANDOM: ['ehrandom', 'ehr'],
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
};

export const EH_URL = process.env.EH_URL;
