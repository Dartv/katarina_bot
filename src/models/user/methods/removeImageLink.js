import R from 'ramda';

export default async function removeImageLink(image) {
  this.images = R.without([image], this.images);
  await this.save();
  return this;
}
