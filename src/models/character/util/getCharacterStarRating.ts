import { CharacterStar, PopularityThreshold } from '../../../util';

export default function getCharacterStarRating(popularity: number): CharacterStar {
  if (popularity <= PopularityThreshold.FIVE_STAR) return CharacterStar.FIVE_STAR;
  if (popularity <= PopularityThreshold.FOUR_STAR) return CharacterStar.FOUR_STAR;
  if (popularity <= PopularityThreshold.THREE_STAR) return CharacterStar.THREE_STAR;
  return CharacterStar.TWO_STAR;
}
