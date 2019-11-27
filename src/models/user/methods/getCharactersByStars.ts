export async function getUserCharactersByStars(
  options: { stars?: number; field?: string },
): Promise<any[]>;

export default async function getUserCharactersByStars({ stars, field = 'characters' }) {
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
}
