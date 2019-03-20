export default async function subscribeToMapper({ mapper }) {
  if (this.subscribedMappers) {
    this.subscribedMappers.push(mapper);
  } else {
    this.subscribedMappers = [mapper];
  }
  await this.save();
  return this;
}
