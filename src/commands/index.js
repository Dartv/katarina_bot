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
import write from './write';
import join from './join';
import play from './play';
import stop from './stop';
import skip from './skip';
import pause from './pause';
import resume from './resume';
import ehrandom from './ehrandom';

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
  write,
  join,
  play,
  stop,
  skip,
  pause,
  resume,
  ehrandom,
];

if (process.env.IMAGE_ART_DIR) commands.push(art);

export default client => client.commands.add(...commands);
