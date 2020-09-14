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
import { Job } from '../types';

const JOB_NAME = 'monitor scoresaber players';
const INTERVAL = 15;
const RANK_THRESHOLD = 100;
const PP_THRESHOLD = 250;
const CHANNEL_IDS = ['687020972670320669', '620373848801411082'];

const shouldSyncScore = (score: PlayerRecentScore, lastRunAt: number): boolean => !!(
  score.pp >= PP_THRESHOLD && score.rank <= RANK_THRESHOLD && new Date(score.timeSet).getTime() > lastRunAt
);

const createScoreEmbed = (score: PlayerRecentScore, player: PlayerBasic['playerInfo']) => {
  const fields = {
    Rank: `#${score.rank}`,
    pp: `${score.pp.toFixed(2)} (${(score.pp * score.weight).toFixed(2)})`,
    Accuracy: `${(score.unmodififiedScore / (score.maxScore || score.score) * 100).toFixed(2)}%`,
    Difficulty: score.difficultyRaw.split('_')[1] || '',
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
          const [{ scores }, { playerInfo }] = await Promise.all([
            scoresaber.fetchPlayerRecentScores(playerId),
            scoresaber.fetchPlayerBasic(playerId),
          ]);
          await Promise.all(scores.reduce((acc: Promise<Message>[], score) => {
            if (shouldSyncScore(score, lastRunAt)) {
              const channel = guild?.channels.cache.find(({ id }) => CHANNEL_IDS.includes(id));
              if (channel) {
                const embed = createScoreEmbed(score, playerInfo);
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

  agenda.every(`${INTERVAL} minutes`, JOB_NAME);
};
