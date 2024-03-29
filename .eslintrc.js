module.exports = {
  env: {
    jest: true,
    node: true,
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: './',
  },
  plugins: [
    '@typescript-eslint',
    'import',
  ],
  settings: {
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts', '.tsx'],
    },
    'import/resolver': {
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
      },
    },
  },
  extends: [
    'plugin:@typescript-eslint/recommended',
    'eslint-config-airbnb-base',
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:import/typescript',
  ],
  rules: {
    'comma-dangle': ['error', {
      arrays: 'always-multiline',
      objects: 'always-multiline',
      imports: 'always-multiline',
      exports: 'always-multiline',
      functions: 'ignore',
    }],
    'max-len': ['error', 120],
    'func-names': 0,
    'import/extensions': 0,
    'no-mixed-operators': 0,
    'no-confusing-arrow': 0,
    'import/no-extraneous-dependencies': 0,
    'import/prefer-default-export': 0,
    'class-methods-use-this': 0,
    'no-underscore-dangle': 0,
    'arrow-parens': 0,
    'no-useless-constructor': 'off',
    '@typescript-eslint/no-useless-constructor': 'error',
    'import/no-cycle': 0,
    'lines-between-class-members': 0,
    '@typescript-eslint/explicit-module-boundary-types': 0,
    'max-classes-per-file': 0,
    'no-restricted-syntax': 0,
  },
};
