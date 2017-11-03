import Store, { thunk } from 'repatch';

export default new Store({
  entities: {},
  allIds: {},
}).addMiddleware(thunk);
