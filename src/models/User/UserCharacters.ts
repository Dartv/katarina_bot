import { Collection } from 'discord.js';
import { Types } from 'mongoose';

import { UserCharacterDocument, UserDocument, CharacterDocument } from '../../types';
import { UserCharacter } from '../UserCharacter';
import { getDocumentId } from '../../utils/mongo-common';

export class UserCharacters extends Collection<string, UserCharacterDocument> {
  constructor(
    public user: UserDocument,
    entries?: ReadonlyArray<readonly [string, UserCharacterDocument]> | null
  ) {
    super(entries);
  }

  async fetchOne(characterId: Types.ObjectId): Promise<UserCharacterDocument | null> {
    if (this.has(characterId.toHexString())) {
      return this.get(characterId.toHexString());
    }

    const userCharacter = await UserCharacter.findOne({
      character: characterId,
      user: this.user._id,
    }).populate({
      path: 'character',
      populate: {
        path: 'series',
      },
    });

    if (userCharacter) {
      this.set(getDocumentId(userCharacter.character).toHexString(), userCharacter);
    }

    return userCharacter;
  }

  async fetchMany(): Promise<UserCharacterDocument[]> {
    const cursor = UserCharacter
      .find({
        user: this.user._id,
      })
      .populate({
        path: 'character',
        populate: {
          path: 'series',
        },
      })
      .cursor();

    await cursor.eachAsync((userCharacter) => {
      this.set(getDocumentId(userCharacter.character).toHexString(), userCharacter);
    });

    return Array.from(this.values());
  }

  async add(character: Types.ObjectId | CharacterDocument): Promise<UserCharacterDocument> {
    const characterId: Types.ObjectId = getDocumentId(character);
    let userCharacter = await this.fetchOne(characterId);

    if (userCharacter) {
      userCharacter.count += 1;
    } else {
      userCharacter = new UserCharacter({
        user: this.user._id,
        character: characterId,
      });
      await userCharacter.populate({
        path: 'character',
        populate: {
          path: 'series',
        },
      }).execPopulate();
    }

    this.set(getDocumentId(userCharacter.character).toHexString(), userCharacter);

    return userCharacter;
  }

  async save(): Promise<UserCharacterDocument[]> {
    const promises = this.map((userCharacter) => userCharacter.save());
    return Promise.all(promises);
  }
}
