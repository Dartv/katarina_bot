import { Guild as DiscordGuild, TextChannel, RichEmbed } from 'discord.js';
import { Client } from 'ghastly';
import { subMinutes, isBefore } from 'date-fns';

import { Guild } from '../models';
import { ScoresaberAPI } from '../services/scoresaber';

const JOB_NAME = 'monitor scoresaber players';
const INTERVAL = 15;
const RANK_THRESHOLD = 100;
const CHANNEL_NAME = 'scores🏆';

export default (agenda, client: Client) => {
  agenda.define(JOB_NAME, async (job, done) => {
    try {
      console.log(job.attrs.lastRunAt);
      const lastRunAt = new Date(subMinutes(new Date(job.attrs.lastRunAt), INTERVAL)).getTime();
      const guilds = Guild.find({ 'services.scoresaber.playerids': { $exists: true, $ne: [] } }).cursor();
      await guilds.eachAsync(async ({ discordId, services: { scoresaber: { playerids } } }) => {
        const guild: DiscordGuild = client.guilds.get(discordId);
        await Promise.all(playerids.map(async (playerid) => {
          const scoresaber = new ScoresaberAPI();
          const [{ scores }, { playerInfo }] = await Promise.all([
            scoresaber.fetchPlayerRecentScores(playerid),
            scoresaber.fetchPlayerBasic(playerid),
          ]);
          await Promise.all(scores.reduce((acc, score) => {
            if (score.pp > 0 && score.rank <= RANK_THRESHOLD && new Date(score.timeset).getTime() > lastRunAt) {
              const channel = guild?.channels.find(({ name }) => name === CHANNEL_NAME);
              if (channel) {
                const embed = new RichEmbed({
                  url: ScoresaberAPI.getLeaderboardUrl(score.leaderboardId, score.rank),
                  title: `${score.songAuthorName} - ${score.name}`,
                  description: '',
                  thumbnail: { url: ScoresaberAPI.getBeatmapImage(score.id) },
                  author: {
                    name: playerInfo.name,
                    /* eslint-disable @typescript-eslint/camelcase */
                    icon_url: ScoresaberAPI.getPlayerAvatar(playerInfo.avatar),
                    /* eslint-enable @typescript-eslint/camelcase */
                  },
                  footer: { text: score.levelAuthorName },
                  fields: [
                    { name: 'Rank', value: `#${score.rank}`, inline: true },
                    {
                      name: 'pp',
                      value: `${score.pp.toFixed(2)} (${(score.pp * score.weight).toFixed(2)})`,
                      inline: true,
                    },
                    {
                      name: '\u200B',
                      value: '\u200B',
                      inline: true,
                    },
                    { name: 'Accuracy', value: `${(score.uScore / score.maxScoreEx * 100).toFixed(2)}%`, inline: true },
                    { name: 'Difficulty', value: score.diff.split('_')[1] || '', inline: true },
                  ],
                });
                return [...acc, (channel as TextChannel).send(embed)];
              }
            }
            return acc;
          }, []));
        }));
      });
    } catch (err) {
      console.error(`Failed job ${JOB_NAME}`);
      console.error(err);
      job.fail(err);
      await job.save();
    }

    done();
  });

  agenda.every(`${INTERVAL} minutes`, JOB_NAME);
};
