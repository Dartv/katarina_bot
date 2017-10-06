import add from './add';
import post from './post';
import list from './list';
import remove from './remove';
import removeAll from './removeAll';
import art from './art';
import help from './help';
import emojify from './emojify';
import guildAdd from './guildAdd';
import guildPost from './guildPost';

const commands = [
  add,
  post,
  list,
  remove,
  removeAll,
  art,
  help,
  emojify,
  guildAdd,
  guildPost,
];

export default client => client.commands.add(...commands);
