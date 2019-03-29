import { CronJob } from 'cron';
import fetch from 'node-fetch';
import R from 'ramda';
import { RichEmbed } from 'discord.js';

import { Subscription } from '../models';
import { Topics, COLORS } from '../util/constants';
import { client } from '../';

const TEN_MINUTES = '0 */5 * * * *';
const URL = 'https://beatsaver.com/api/songs/new';
const MAPS_PER_PAGE = 20;

const MAPPER_INFO = 'MAPPER_INFO';

const sleep = timeout => new Promise(resolve => setTimeout(resolve, timeout));

const onTick = async (start = 0) => {
  if (start > MAPS_PER_PAGE * 3) return Promise.resolve();

  const res = await fetch(`${URL}/${start}`);
  const { songs } = await res.json();
  const data = R.groupBy(R.prop('uploader'), songs);
  const subs = await Subscription.find({ topic: Topics.MAPPER });
  const subscriptions = R.groupBy(R.prop('value'), subs);
  const mapperInfo = await Subscription.findOne({ userId: MAPPER_INFO });
  const lastFetchedAt = mapperInfo ? mapperInfo.value : new Date().getTime();
  const promise = await Object.keys(data).map((mapper) => {
    if (subscriptions[mapper]) {
      return subscriptions[mapper].map(({ userId }) => {
        const promises = data[mapper].map(async (song) => {
          if (new Date(song.createdAt.date).getTime() < lastFetchedAt) return undefined;

          const user = await client.fetchUser(userId);
          const DMChannel = await user.createDM();
          const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
          const date = new Date(song.createdAt.date).toLocaleDateString(undefined, options);
          const embed = new RichEmbed();
          embed
            .setColor(COLORS.INFO)
            .setTitle(song.name)
            .setDescription(`${mapper} uploaded new map`)
            .addField('Uploader', song.uploader)
            .addField('BPM', song.bpm)
            .addField('Version', song.version)
            .addField('Difficulties', Object.keys(song.difficulties).join(', '))
            .setURL(song.linkUrl)
            .setThumbnail(song.coverUrl)
            .setAuthor(user.username, user.avatarURL)
            .setFooter(date);
          return DMChannel.send(embed);
        });
        return Promise.all(promises);
      });
    }

    return undefined;
  });

  await Promise.all(R.flatten(promise)).then(R.reject(R.isNil));

  await sleep(500);

  return onTick(start + MAPS_PER_PAGE);
};

export default new CronJob({
  cronTime: TEN_MINUTES,
  onTick: async () => {
    console.log('Scanning new songs...');
    try {
      await onTick(0);

      const query = { userId: MAPPER_INFO };
      const modifier = {
        $set: {
          userId: MAPPER_INFO,
          guildId: MAPPER_INFO,
          topic: Topics.INFO,
          value: new Date().getTime(),
        },
      };
      const options = { upsert: true };
      await Subscription.updateOne(query, modifier, options);
    } catch (err) {
      console.error(err);
    }
  },
});
