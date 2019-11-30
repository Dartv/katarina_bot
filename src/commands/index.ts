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
import eh from './eh';
import exh from './exh';
import danbooru from './danbooru';
import roll from './roll';
import mywaifus from './mywaifus';
import mywaifu from './mywaifu';
import addfav from './addfav';
import favs from './favs';
import delfav from './delfav';
import scrape from './scrape';

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
  eh,
  exh,
  danbooru,
  roll,
  mywaifus,
  mywaifu,
  addfav,
  favs,
  delfav,
  scrape,
];

if (process.env.IMAGE_ART_DIR) commands.push(art);

export default client => client.commands.add(...commands);
