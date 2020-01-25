import { ICharacter } from '../types';
import CharacterInfo from '../../characterInfo';

const fetchInfo: ICharacter['fetchInfo'] = async function (user) {
  const characterInfo = await CharacterInfo.findOne({
    user,
    character: this._id,
  });

  Object.assign(this, { info: characterInfo });

  return this;
};

export default fetchInfo;
