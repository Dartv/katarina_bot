import { getCharacterStarRating } from '../util';
import { CharacterStar } from '../../../util';

export default function getStarRating(): CharacterStar {
  return getCharacterStarRating(this.popularity);
}
