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
import guildList from './guildList';
import guildRemove from './guildRemove';

const commands = [
  add,
  post,
  list,
  remove,
  removeAll,
  help,
  emojify,
  guildAdd,
  guildPost,
  guildList,
  guildRemove,
];

if (process.env.IMAGE_ART_DIR) commands.push(art);

export default client => client.commands.add(...commands);
