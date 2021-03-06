const { MongoClient } = require('mongodb');

const eachAsync = async (callback, stream) => {
  while (await stream.hasNext()) {
    await callback(await stream.next());
  }
};

const drop = async (collection, collections) => {
  if (collections.find(({ name }) => name === collection.collectionName)) {
    return collection.drop();
  }
};

console.log('Starting wipe...');

MongoClient
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(async (client) => {
    const db = client.db();
    const Users = db.collection('users');
    const UserCharacters = db.collection('usercharacters');
    const UserRolls = db.collection('userrolls');
    const Guilds = db.collection('guilds');
    const Achievements = db.collection('achievements');
    const Missions = db.collection('missions');
    const AgendaJobs = db.collection('agendaJobs');
    const Banners = db.collection('banners');
    const CharacterInfo = db.collection('characterInfo');
    const Marriages = db.collection('marriages');
    const Characters = db.collection('characters');
    const Versus = db.collection('versus');
    const WallOfShame = db.collection('wallOfShame');
    const WorldBosses = db.collection('worldbosses');
    const Stages = db.collection('stages');
    const collections = await db.listCollections().toArray();

    await eachAsync(
      async (user) => Promise.all([
        Users.updateOne(
          { _id: user._id },
          {
            $set: {
              favorites: [],
              currency: 0,
              correctQuizGuesses: 0,
              settings: {},
            },
            $unset: {
              characters: '',
              images: '',
              lastRolledAt: '',
              rolls: '',
              deck: '',
              visitedAt: '',
              quote: '',
              services: '',
            },
          },
        ),
        ...(user.waifu ? [
          UserCharacters.insertOne({
            count: 1,
            user: user._id,
            character: user.waifu,
            createdAt: new Date(),
            updatedAt: new Date(),
          }),
          UserRolls.insertOne({
            drop: user.waifu,
            banner: 'normal',
            createdAt: new Date(),
            updatedAt: new Date(),
          }),
        ] : []),
      ]),
      db.collection('users').find({}).stream(),
    );

    await Guilds.updateMany({}, {
      $unset: {
        images: '',
        services: '',
      },
    });

    await Characters.updateMany({}, {
      $unset: {
        cardImageUrl: '',
        stars: '',
      },
    });

    await Achievements.deleteMany({});
    await Missions.deleteMany({});
    await AgendaJobs.deleteMany({});
    await Banners.deleteMany({});
    await drop(CharacterInfo, collections);
    await drop(Marriages, collections);
    await drop(Versus, collections);
    await drop(WallOfShame, collections);
    await drop(WorldBosses, collections);
    await drop(Stages, collections);
  })
  .then(() => {
    console.log('Wipe finished');
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
