'use strict'

const common = {
  env: {
    browser: true,
    es6: true,
    node: true,
  },
  extends: ['eslint:recommended', 'plugin:prettier/recommended'],
  parser: '@babel/eslint-parser',
  parserOptions: {
    requireConfigFile: false,
    ecmaVersion: 2020,
  },
  plugins: ['import', 'prettier'],
  rules: {
    'import/order': [
      'error',
      {
        alphabetize: {
          caseInsensitive: true,
          order: 'asc',
        },
      },
    ],
    'no-warning-comments': ['warn', { location: 'start', terms: ['hack', '@hack', 'fixme'] }],
    'padding-line-between-statements': [
      'warn',
      { blankLine: 'always', prev: '*', next: 'block' },
      { blankLine: 'always', prev: '*', next: 'block-like' },
      { blankLine: 'always', prev: 'const', next: 'expression' },
      { blankLine: 'always', prev: 'let', next: 'expression' },
      { blankLine: 'always', prev: 'var', next: 'expression' },
      { blankLine: 'always', prev: 'block', next: '*' },
      { blankLine: 'always', prev: 'block-like', next: '*' },
      { blankLine: 'always', prev: '*', next: 'return' },
    ],
  },
  settings: {
    'import/resolver': {
      node: {
        extentions: ['.js', '.ts'],
      },
    },
  },
}

module.exports = {
  ...common,
  overrides: [
    {
      ...common,
      files: ['**/*.ts'],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        ecmaVersion: 2018,
        sourceType: 'module',
      },
      plugins: ['@typescript-eslint', 'node', 'prettier'],
      extends: [
        'eslint:recommended',
        'plugin:node/recommended',
        'plugin:@typescript-eslint/eslint-recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:prettier/recommended',
      ],
      rules: {
        ...common.rules,
        '@typescript-eslint/explicit-module-boundary-types': 'error',

        // Disable rules
        '@typescript-eslint/interface-name-prefix': 0,
        '@typescript-eslint/member-delimiter-style': 0,
        '@typescript-eslint/no-empty-interface': 0,
        // @todo: remove this
        '@typescript-eslint/no-explicit-any': 0,
        'node/no-unsupported-features/es-syntax': 'off', // Does not account for transpilation
        'node/no-unpublished-require': 'off', // Does not account for "build" scripts
        'node/no-unpublished-import': 'off', // Does not account for "build" scripts
        'node/shebang': 'off', // Tons of false positives
        'node/no-missing-import': [
          'error',
          {
            allowModules: [],
            resolvePaths: ['./src'],
            tryExtensions: ['.js', '.ts'],
          },
        ],
        'prettier/prettier': ['off', { trailingComma: 'all' }],
      },
    },
  ],
}
