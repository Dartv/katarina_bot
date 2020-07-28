import { Command } from 'diskat';
import { MessageEmbed, Constants } from 'discord.js';

import { Context, UserDocument } from '../../types';
import { Trigger, MissionCode, Missions } from '../../utils/constants';
import { injectUser } from '../middleware';
import { Mission } from '../../models';
import { indexBy, capitalize } from '../../utils/common';

interface MissionsCommandContext extends Context {
  user: UserDocument;
}

const MissionsCommandContext: Command<MissionsCommandContext> = async (context) => {
  const { user, message, formatter } = context;
  const missions = await Mission.find({ user: user._id })
    .then(ms => indexBy(m => m.code, ms))
    .then(ms => Object.keys(MissionCode).map((code) => {
      if (ms[code]) return ms[code];

      return new Mission({
        code,
        user: user._id,
      });
    }));
  const color = missions.every(m => m.completedAt) ? Constants.Colors.GREEN : Constants.Colors.BLUE;
  const embed = new MessageEmbed()
    .setAuthor(message.member.displayName, message.author.avatarURL())
    .setColor(color)
    .addField(
      'Mission',
      missions.map(mission => {
        const description = capitalize(Missions[mission.code].description);
        return mission.completedAt ? formatter.strikeout(description) : description;
      }).join('\n'),
      true,
    )
    .addField(
      'Reward',
      missions.map(mission => `${Missions[mission.code].reward} 💎`).join('\n'),
      true,
    );

  return embed;
};

MissionsCommandContext.config = {
  triggers: Trigger.MISSIONS,
  description: 'View your missions',
  middleware: [
    injectUser(),
  ],
};

export default MissionsCommandContext;
