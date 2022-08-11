import { format, subMinutes } from 'date-fns';
import {
  Constants,
  Message,
  MessageEmbed,
  TextChannel,
} from 'discord.js';
import { LimitedWorld } from 'vrchat';
import { Guild } from '../models';
import { VRChat } from '../services/vrchat';
import { Job } from '../types';
import { GuildSetting } from '../utils/constants';
import { isProd } from '../utils/environment';

const JOB_NAME = 'monitor vrchat worlds';
const INTERVAL = 30;

const createWorldEmbed = (world: LimitedWorld) => new MessageEmbed()
  .setTitle(world.name)
  .setURL(VRChat.getWorldPublicUrl(world.id))
  .setThumbnail(world.thumbnailImageUrl)
  .setAuthor(world.authorName, 'https://s3.amazonaws.com/assets.vrchat.com/www/images/Badge_VRCat.png')
  .setFooter(format(new Date(world.labsPublicationDate), 'dd MMM yyyy'))
  .setColor(Constants.Colors.BLUE);

export const VRChatWorldsMonitorJob: Job = (agenda, client) => {
  agenda.define(JOB_NAME, async (job, done) => {
    try {
      const vrchat = new VRChat();
      const lastRunAt = new Date(subMinutes(new Date(job.attrs.lastRunAt), INTERVAL)).getTime();
      const cursor = Guild.find({
        'services.vrchat.trackedCreatorIds': { $exists: true, $ne: [] },
        [`settings.${GuildSetting.VRC_WORLDS_CHANNEL}`]: { $ne: null },
      }).cursor();
      const channelIdsByCreatorId = new Map<string, string[]>();

      // make a map of discord channel id by creator id for fast access
      await cursor.eachAsync((guild) => {
        const channelId = guild.settings?.vrcWorldsChannel;

        guild.services?.vrchat?.trackedCreatorIds?.forEach((creatorId) => {
          if (channelIdsByCreatorId.has(creatorId)) {
            channelIdsByCreatorId.get(creatorId).push(channelId);
          } else {
            channelIdsByCreatorId.set(creatorId, [channelId]);
          }
        });
      });

      if (!channelIdsByCreatorId.size) {
        return;
      }

      // iterate creators, fetch their worlds and publish only the new worlds
      for await (const creatorId of channelIdsByCreatorId.keys()) {
        try {
          const { data: worlds } = await vrchat.searchWorlds({
            userId: creatorId,
            limit: 5,
            sortBy: 'labsPublicationDate',
            sortOrder: 'descending',
            releaseStatus: 'public',
          });

          await Promise.all(worlds.reduce((acc: Promise<Message>[], world) => {
            const publishedAt = new Date(world.labsPublicationDate).getTime();

            if (publishedAt > lastRunAt) {
              const channelIds = channelIdsByCreatorId.get(creatorId);
              const channels = client.channels.cache.filter(({ id }) => channelIds.includes(id));
              const embed = createWorldEmbed(world);
              const promises = channels.map(channel => (channel as TextChannel).send(embed));

              return [
                ...acc,
                ...promises,
              ];
            }

            return acc;
          }, []));
        } catch (err) {
          client.logger.error(`Something went wrong when tracking vrchat creator ${creatorId}`);
        }
      }
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
