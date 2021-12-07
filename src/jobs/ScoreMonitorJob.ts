import {
  Constants,
  Guild as DiscordGuild,
  Message,
  MessageEmbed,
  TextChannel,
} from 'discord.js';
import { subMinutes } from 'date-fns';
import { MarkdownFormatter } from 'diskat';

import { Guild } from '../models';
import { PlayerBasic, PlayerRecentScore, ScoresaberAPI } from '../services/scoresaber';
import { BeatsaviorAPI, BeatSaviorInfo } from '../services/beatsavior';
import { Job } from '../types';
import { isProd } from '../utils/environment';

const JOB_NAME = 'monitor scoresaber players';
const INTERVAL = 15;
const WEIGHT_TOP_8 = 0.77; // top 8 = 0.965^7
const WEIGHT_TOP_20 = 0.5 // top 20 = 0.965^19
const CHANNEL_IDS = ['687020972670320669', '620373848801411082'];

const shouldSyncScore = (score: PlayerRecentScore, lastRunAt: number): boolean => !!(
  score.pp >= 250 &&
  new Date(score.timeSet).getTime() > lastRunAt && (
    score.rank <= 10 ||
    score.weight >= WEIGHT_TOP_8 ||
    (score.rank <= 100 && score.weight >= WEIGHT_TOP_20)
  )
);

const recentSongBeatSaviorInfo = (score: PlayerRecentScore, scoreInfos?: BeatSaviorInfo[]): BeatSaviorInfo => {
  return scoreInfos?.slice().reverse().find(scoreInfo =>
      scoreInfo.songID === score.songHash
      && scoreInfo.songDifficultyRank === score.difficulty
      && scoreInfo.trackers?.winTracker?.won
      && scoreInfo.trackers?.scoreTracker?.rawRatio > scoreInfo.trackers?.scoreTracker?.personalBestRawRatio
  );
};

const createScoreEmbed = (score: PlayerRecentScore, player: PlayerBasic['playerInfo'], beatSaviorInfo?: BeatSaviorInfo) => {
  const fields = {
    Rank: `#${score.rank}`,
    pp: `${score.pp.toFixed(2)} (${(score.pp * score.weight).toFixed(2)})`,
    Accuracy: `${(score.unmodififiedScore / (score.maxScore || score.score) * 100).toFixed(2)}%`,
    Difficulty: score.difficultyRaw.split('_')[1] || '',
    ...(beatSaviorInfo?.trackers?.hitTracker?.badCuts > 0 && {
      "Bad cuts": beatSaviorInfo.trackers.hitTracker.badCuts,
    }),
    ...(beatSaviorInfo?.trackers?.hitTracker?.missedNotes > 0 && {
      "Missed notes": beatSaviorInfo.trackers.hitTracker.missedNotes,
    }),
  };

  return new MessageEmbed()
    .setTitle(`${score.songAuthorName} - ${score.songName} ${score.songSubName}`.trim())
    .setURL(ScoresaberAPI.getLeaderboardUrl(score.leaderboardId, score.rank))
    .setThumbnail(ScoresaberAPI.getBeatmapImage(score.songHash))
    .setAuthor(player.playerName, ScoresaberAPI.getPlayerAvatar(player.avatar))
    .setFooter(score.levelAuthorName)
    .setColor(Constants.Colors.BLUE)
    .addField(
      '\u200B',
      Object.keys(fields).map(MarkdownFormatter.bold).join('\n'),
      true,
    )
    .addField(
      '\u200B',
      Object.values(fields).join('\n'),
      true,
    );
};

export const ScoreMonitorJob: Job = (agenda, client) => {
  agenda.define(JOB_NAME, async (job, done) => {
    try {
      const lastRunAt = new Date(subMinutes(new Date(job.attrs.lastRunAt), INTERVAL)).getTime();
      const guilds = Guild.find({ 'services.scoresaber.playerIds': { $exists: true, $ne: [] } }).cursor();
      await guilds.eachAsync(async ({ discordId, services: { scoresaber: { playerIds } } }) => {
        const guild: DiscordGuild = client.guilds.cache.get(discordId);
        await Promise.all(playerIds.map(async (playerId) => {
          const scoresaber = new ScoresaberAPI();
          const beatsavior = new BeatsaviorAPI();
          const [{ scores }, { playerInfo }, saviorData] = await Promise.all([
            scoresaber.fetchPlayerRecentScores(playerId),
            scoresaber.fetchPlayerBasic(playerId),
            beatsavior.fetchUserLastPlayedInfo(playerId).catch(err => {
              console.error(err);
              return [];
            }),
          ]);
          await Promise.all(scores.reduce((acc: Promise<Message>[], score) => {
            if (shouldSyncScore(score, lastRunAt)) {
              const channel = guild?.channels.cache.find(({ id }) => CHANNEL_IDS.includes(id));
              if (channel) {
                const beatSaviorInfo = recentSongBeatSaviorInfo(score, saviorData);
                const embed = createScoreEmbed(score, playerInfo, beatSaviorInfo);
                return [...acc, (channel as TextChannel).send(embed)];
              }
            }
            return acc;
          }, []));
        }));
      });

      done();
    } catch (err) {
      job.fail(err);
      await job.save();
      done(err);
    }
  });

  if (isProd()) {
    agenda.every(`${INTERVAL} minutes`, JOB_NAME);
  }
};
