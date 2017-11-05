import Store, { thunk } from 'repatch';

export const initialState = {
  entities: {},
  allIds: {},
};

export default new Store(initialState).addMiddleware(thunk);
