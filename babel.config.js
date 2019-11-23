module.exports = {
  plugins: ['transform-object-rest-spread'],
  presets: [
    [
      'env',
      {
        targets: {
          node: 'current',
        },
      },
    ],
    '@babel/preset-typescript',
  ],
};
