import { Response } from 'diskat';
import {
  Message,
  MessageEmbed,
  Constants,
  User,
} from 'discord.js';
import { Context } from '../../types';

export interface SuccessResponseOptions {
  title?: string;
  description?: string;
  author?: User;
  modify?: (embed: MessageEmbed) => MessageEmbed;
}

export class SuccessResponse extends Response<Message> {
  constructor(options: SuccessResponseOptions, { message }: Context) {
    const {
      title = 'Success',
      description = '',
      author = message.author,
      modify = embed => embed,
    } = options;
    super(async () => {
      const embed = new MessageEmbed();
      embed
        .setColor(Constants.Colors.GREEN)
        .setAuthor(author.username, author.avatarURL())
        .setTitle(`✅ ${title}`)
        .setDescription(description);
      return message.channel.send('', { embed: modify(embed) });
    });
  }
}
