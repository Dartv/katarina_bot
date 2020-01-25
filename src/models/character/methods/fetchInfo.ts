import { ICharacter } from '../types';
import { CharacterInfo } from '../..';

const fetchInfo: ICharacter['fetchInfo'] = async function (user) {
  const characterInfo = await CharacterInfo.findOne({ user, character: this._id });
  Object.assign(this, characterInfo || {});
  return this;
};

export default fetchInfo;
