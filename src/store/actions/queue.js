import R from 'ramda';

import { lenses, viewOr } from '../../util';
import { initialState } from '../';

const reduceQueue = R.curry((reducer, id, state) => ({
  ...state,
  entities: {
    ...state.entities,
    [id]: reducer(state.entities[id] || initialState),
  },
}));

export const enqueue = (item, id) => reduceQueue(R.compose(
  R.over(lenses.allIds, R.append(item.id)),
  R.set(lenses.entities.entity(item.id), item),
), id);


export const dequeue = reduceQueue((state) => {
  const id = R.view(lenses.allIds.head);
  return R.when(
    id,
    R.compose(
      R.over(lenses.allIds, R.drop(1)),
      R.over(lenses.entities, R.dissoc(id(state))),
    ),
    state,
  );
});

export const clear = reduceQueue(R.compose(
  R.set(lenses.entities, {}),
  R.set(lenses.allIds, []),
));

export const getQueue = context => state => () =>
  viewOr(initialState, lenses.entities.entity(context.message.guild.id), state);

export const peek = context => () => dispatch => R.compose(
  R.converge(R.view, [
    R.compose(lenses.entities.entity, R.view(lenses.allIds.head)),
    R.identity,
  ]),
  R.compose(dispatch, getQueue),
)(context);

export const getQueueItem = (id, context) => () => dispatch => R.compose(
  R.view(lenses.entities.entity(id)),
  R.compose(dispatch, getQueue),
)(context);

export const getQueueSize = context => () => dispatch => R.compose(
  R.length,
  R.view(lenses.allIds),
  R.compose(dispatch, getQueue),
)(context);
