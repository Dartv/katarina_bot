export default async function addImageLink() {
  this.images = [];
  await this.save();
  return this;
}
