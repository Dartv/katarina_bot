import gm from 'gm';
import { promisify } from 'util';

Object.assign(gm, {
  prototype: Object.assign(gm.prototype, {
    size: promisify(gm.prototype.size),
    write: promisify(gm.prototype.write),
  }),
});

export default gm;
