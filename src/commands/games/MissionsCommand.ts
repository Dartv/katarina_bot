import { Command, TypeResolver } from 'diskat';
import { MessageEmbed, Constants } from 'discord.js';

import { Context, UserDocument } from '../../types';
import {
  Trigger,
  MissionCode,
  Missions,
  CommandGroupName,
  MissionFrequency,
} from '../../utils/constants';
import { injectUser } from '../middleware';
import { Mission } from '../../models';
import { indexBy, capitalize } from '../../utils/common';

interface MissionsCommandContext extends Context {
  user: UserDocument;
  args: {
    frequency: MissionFrequency;
  };
}

const MissionsCommandContext: Command<MissionsCommandContext> = async (context) => {
  const {
    user,
    message,
    formatter,
    args: {
      frequency,
    },
  } = context;
  const missions = await Mission.find({ user: user._id, frequency })
    .then(ms => indexBy(m => m.code, ms))
    .then(ms => Object.keys(MissionCode)
      .filter((code: MissionCode) => Missions[code].frequency === frequency)
      .map((code) => {
        if (ms[code]) return ms[code];

        return new Mission({
          code,
          user: user._id,
          frequency,
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
  group: CommandGroupName.GAMES,
  parameters: [
    {
      name: 'frequency',
      description: Object.values(MissionFrequency).map(freq => freq.toLowerCase()).join('/'),
      optional: true,
      defaultValue: MissionFrequency.DAILY,
      type: TypeResolver.oneOf(
        TypeResolver.Types.STRING_UPPER,
        Object.values(MissionFrequency),
      ),
    },
  ],
  middleware: [
    injectUser(),
  ],
};

export default MissionsCommandContext;
