import { ICharacter } from '../types';

const fight: ICharacter['fight'] = function (character) {
  if (this.stars > character.stars || this.popularity < character.popularity) {
    return true;
  }

  return false;
};

export default fight;
