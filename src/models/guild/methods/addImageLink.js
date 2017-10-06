export default async function addImageLink({ ref, url, user }) {
  console.log(user);
  this.images.push({ ref, url, user });
  await this.save();
  return this;
}
