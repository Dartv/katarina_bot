export interface IGetCharactersByStarsInput {
  stars?: number;
  field?: string;
  limit?: number;
  skip?: number;
}

export type IGetCharactersByStars = (options: IGetCharactersByStarsInput) => Promise<any[]>;

const getUserCharactersByStars: IGetCharactersByStars = async function getUserCharactersByStars({
  stars,
  field = 'characters',
  limit,
  skip,
}) {
  return this.constructor.aggregate([
    {
      $match: {
        _id: this._id,
      },
    },
    {
      $lookup: {
        from: 'characters',
        as: 'characters',
        let: { characters: `$${field}` },
        pipeline: [
          {
            $match: {
              ...(stars && { stars: Number(stars) }),
              $expr: {
                $in: ['$_id', '$$characters'],
              },
            },
          },
          { $sort: { stars: -1 } },
          ...(skip ? [{ $skip: skip }] : []),
          ...(limit ? [{ $limit: limit }] : []),
        ],
      },
    },
    {
      $unwind: '$characters',
    },
    {
      $group: {
        _id: '$characters._id',
        name: { $first: '$characters.name' },
        count: { $sum: 1 },
      },
    },
  ]);
};

export default getUserCharactersByStars;
