import add from './add';
import post from './post';
import list from './list';
import remove from './remove';
import removeAll from './removeAll';
import art from './art';
import help from './help';

const commands = [add, post, list, remove, removeAll, art, help];

export default client => client.commands.add(...commands);
