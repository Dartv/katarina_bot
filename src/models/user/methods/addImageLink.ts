export default async function addImageLink({ ref, url }) {
  this.images.push({ ref, url });
  await this.save();
  return this;
}
