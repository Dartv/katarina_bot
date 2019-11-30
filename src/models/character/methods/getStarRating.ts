import { getCharacterStarRating } from '../util';

export default async function getStarRating() {
  return getCharacterStarRating(this.popularity);
}
