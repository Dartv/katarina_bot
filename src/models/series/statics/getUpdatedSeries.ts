export default async function getUpdatedSeries(series: { title: string; slug: string }[]): Promise<any> {
  const docs = series.map(({ title, slug }) => {
    const query = { slug };
    const modifier = {
      $set: {
        title,
        slug,
      },
    };
    const options = { upsert: true, new: true };
    return this.findOneAndUpdate(query, modifier, options);
  });

  return Promise.all(docs);
}
