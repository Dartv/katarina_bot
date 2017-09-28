module.exports = function addImageLink({ ref, url }) {
  this.images.push({ ref, url });
  return this.save();
};
