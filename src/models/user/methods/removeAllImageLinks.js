export default async function removeAllImageLinks() {
  this.images = [];
  await this.save();
  return this;
}
