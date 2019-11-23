import ytdl from 'ytdl-core';
import { RichEmbed } from 'discord.js';

export default class YoutubeVideo {
  id

  title

  channel

  description

  duration

  publishedAt

  url

  rawId

  constructor(video) {
    const {
      channel,
      description,
      duration,
      id,
      publishedAt,
      title,
      url,
    } = video;

    this.id = `YouTube-${id}`;

    this.title = title;

    this.channel = channel;

    this.description = description;

    this.duration = duration;

    this.publishedAt = publishedAt;

    this.url = url;

    this.rawId = id;
  }

  get embed() {
    const embed = new RichEmbed();

    embed.setTitle(`[NOW PLAYING] ${this.title}`)
      // eslint-disable-next-line max-len
      // .setDescription(this.description.length <= 240 ? this.description : `${this.description.slice(0, 237)}...`)
      .setURL(this.url)
      .addField('Duration', this.formattedDuration, true)
      .addField('Channel', this.channel.title, true);

    return embed;
  }

  get formattedDuration() {
    const { hours, minutes, seconds } = this.duration;
    // eslint-disable-next-line max-len
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  createStream() {
    return ytdl(this.url, { filter: 'audioonly' });
  }
}
