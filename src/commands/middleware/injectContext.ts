import * as models from '../../models';

export default () => async (next, context) => next({
  ...context,
  models,
});
