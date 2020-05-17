import { expectUser } from 'ghastly/lib/middleware';
import { Message } from 'discord.js';
import { ICommand, ICommandHandler, Middleware } from 'ghastly';

import { COMMAND_TRIGGERS } from '../util';
import Character from '../models/character';
import { createCharacterEmbed } from '../models/character/util';
import { Versus } from '../models';
import { injectUser, injectGuild } from './middleware';

const decideWinner = (): Middleware => async (next, context) => {
  const { dispatch, guild, message } = context;
  const query = { guild: guild._id };
  const options = { sort: { createdAt: -1 } };
  let versus = await Versus.findOne(query, '', options);

  if (versus) {
    const promises = versus.characters.map(
      async ({ messageId }, i) => {
        const msg = await message.channel.fetchMessage(messageId);
        if (msg) {
          const reaction = msg.reactions.find(({ emoji }) => emoji.name === '❤️');
          if (reaction) {
            versus.characters[i].votes = reaction.count;
          }
        } else {
          versus.characters[i].votes = 0;
        }
      },
    );
    await Promise.all(promises);
    const winner = versus.characters.reduce((prev, curr) => prev.votes < curr.votes ? curr : prev);
    versus.winner = winner?.self;
    await versus.save();
    versus = await versus.populate({
      path: 'winner',
      populate: {
        path: 'series',
      },
    }).execPopulate();
    if (versus.winner instanceof Character) {
      const embed = createCharacterEmbed(versus.winner);
      await dispatch(`Today's winner is ${versus.winner.name} with ${winner.votes} votes!`);
      await dispatch(embed);
    }
  }

  return next(context);
};

const handler: ICommandHandler = async (context) => {
  const {
    dispatch,
    user,
    guild,
    args: { stars },
  } = context;

  const characters = await Character.random(2, [
    {
      $match: { stars: Number(stars) },
    },
  ]);
  await dispatch('Who is a better waifu?');
  const messages: Message[] = await Promise.all(
    characters.map(character => dispatch(createCharacterEmbed(character))),
  );
  await Promise.all(
    messages.map(msg => msg.react('❤️')),
  );

  await new Versus({
    guild: guild._id,
    createdBy: user._id,
    characters: characters.map((character, i) => ({
      self: character._id,
      messageId: messages[i].id,
    })),
  }).save();
};

export default (): ICommand => ({
  middleware: [
    expectUser(process.env.SUPER_ADMIN_ID),
    injectUser(),
    injectGuild(),
    decideWinner(),
  ],
  handler,
  triggers: COMMAND_TRIGGERS.VERSUS,
  description: 'Waifu versus battle',
  parameters: [
    {
      name: 'stars',
      description: 'stars',
      defaultValue: 5,
      optional: true,
    },
  ],
});
