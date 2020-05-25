import { CharacterStar, Color } from './constants';

export const getColorByStars = (stars: CharacterStar): Color => {
  switch (stars) {
    case CharacterStar.THREE_STAR:
      return Color.GREEN;
    case CharacterStar.FOUR_STAR:
      return Color.BLUE;
    case CharacterStar.FIVE_STAR:
      return Color.GOLD;
    case CharacterStar.SIX_STAR:
      return Color.PURPLE;
    case CharacterStar.TWO_STAR:
    default:
      return Color.WHITE;
  }
};
