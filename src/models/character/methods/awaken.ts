import R from 'ramda';

import { ICharacter } from '../types';
import { getCharacterAdditionalStars } from '../util';

const restrictStars = R.clamp(2, 6);

const awaken: ICharacter['awaken'] = function (user) {
  const copies = user.characters.filter(id => this._id.equals(id));
  const additionalStars = getCharacterAdditionalStars(this.stars, copies.length);

  this.stars = restrictStars(this.stars + additionalStars);
  this.$locals.additionalStars = additionalStars;

  return this;
};

export default awaken;
