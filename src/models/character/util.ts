import { CharacterStar } from '../../util';

export function getCharacterStarRating(popularity: number): CharacterStar {
  if (popularity <= 500) return CharacterStar.FIVE_STAR;
  if (popularity <= 3000) return CharacterStar.FOUR_STAR;
  if (popularity <= 10000) return CharacterStar.THREE_STAR;
  return CharacterStar.TWO_STAR;
}
