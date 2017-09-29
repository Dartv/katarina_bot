const R = require('ramda');

module.exports = function addImageLink(image) {
  this.images = R.without([image], this.images);
  return this.save();
};
