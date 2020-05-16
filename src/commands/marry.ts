import { identity } from 'ramda';
import { ICommand, ICommandHandler } from 'ghastly';

import { COMMAND_TRIGGERS, MarriageStatus, PriceTable } from '../util';
import { injectUser, injectGuild, withPrice } from './middleware';
import { ErrorResponse } from './responses';
import { Marriage } from '../models';

const middleware = [injectUser(), injectGuild(), withPrice(PriceTable.MARRY)];

const handler: ICommandHandler = async (context) => {
  const {
    user,
    guild,
    dispatch,
    message: { mentions, member },
  } = context;

  if (!mentions.members.size) return null;

  const wifeMember = mentions.members.first();

  if (wifeMember.id === user.discordId) {
    return ErrorResponse('You can\'t marry yourself', context);
  }

  const { user: wifeUser } = await injectUser(
    async () => ({ discordUser: wifeMember.user }),
  )(identity, context);

  const [marriage, proposal] = await Promise.all([
    Marriage.findOne({
      status: MarriageStatus.MARRIED,
      guild: guild._id,
      $or: [
        { husband: user._id },
        { wife: user._id },
        { husband: wifeUser._id },
        { wife: wifeUser._id },
      ],
    }),
    Marriage.findOne({
      status: MarriageStatus.PROPOSED,
      guild: guild._id,
      $or: [
        { husband: user._id, wife: wifeUser._id },
        { husband: wifeUser._id, wife: user._id },
      ],
    }),
  ]);

  if (marriage) {
    const errorText = marriage.husband.equals(user._id) || marriage.wife.equals(user._id)
      ? 'You\'re already married'
      : `${wifeMember.displayName} is already married`;
    return ErrorResponse(errorText, context);
  }

  if (proposal) {
    // user is a husband, throw
    if (proposal.husband.equals(user._id)) {
      return ErrorResponse(`You've already proposed to ${wifeMember.displayName}`, context);
    }

    await proposal.marry();

    await dispatch(
      `Congratulations on your marriage ${member.displayName}, ${wifeMember.displayName}. `
      + 'Wishing you a lifetime of love and happiness ❤️',
    );

    return null;
  }

  await new Marriage({
    husband: user._id,
    wife: wifeUser._id,
    guild: guild._id,
  }).save();

  const command = `${process.env.BOT_PREFIX}${COMMAND_TRIGGERS.MARRY[0]} ${member}`;

  await dispatch(
    `${wifeMember} you've been proposed to by ${member.displayName} ❤️. Accept proposal by typing ${command}`
  );

  return null;
};

export default (): ICommand => ({
  middleware,
  handler,
  triggers: COMMAND_TRIGGERS.MARRY,
  description: 'Marry someone',
});
