// module.exports = {
//   parser: '@typescript-eslint/parser',
//   plugins: ['@typescript-eslint/eslint-plugin', 'simple-import-sort'],
//   // extends: ['airbnb-typescript/base'],
//   root: true,
//   env: {
//     node: true,
//     jest: true,
//     browser: true,
//   },
//   ignorePatterns: ['.eslintrc.js', '**/autoLayout.js', '**/heap.js'],
//   settings: {
//     "import/core-modules": [ "electron" ],
//     "import/resolver": {
//       typescript: {}
//     },
//   },
//   rules: {
//     'import/prefer-default-export': 0,
//     'no-param-reassign': 0,
//     'no-restricted-syntax': 0,
//     'no-console': 0,
//     'class-methods-use-this': 0,
//     'max-classes-per-file': 0,
//     'no-await-in-loop': 0,
//     'no-underscore-dangle': ['error', { allow: ['_id', '__v', '__type', '__user', '__workspace'] }],
//     'import/no-cycle': 0,
//     'max-len': ['error', { 'code': 140 }],
//     'simple-import-sort/imports': 'error',
//     'import/no-extraneous-dependencies': ['error', {
//       'devDependencies': ['**/*.spec.js', '**/*.e2e-spec.js', '**/*.spec.ts', '**/*.e2e-spec.ts']
//     }],
//     'arrow-parens': [2, 'as-needed', { 'requireForBlockBody': true }],
//     'object-curly-newline': ['error', {
//       ObjectExpression: { minProperties: 6, multiline: true, consistent: true },
//       ObjectPattern: { minProperties: 6, multiline: true
//         , consistent: true },
//       ImportDeclaration: { minProperties: 6, multiline: true, consistent: true },
//       ExportDeclaration: { minProperties: 6, multiline: true, consistent: true },
//     }],
//     "@typescript-eslint/indent": ["error", 4],
//     "@typescript-eslint/camelcase": "off",
//     'import/extensions': ["error", "never"],
//     'no-plusplus': 'off',
//     "function-paren-newline": ["error", "multiline"],
//     'linebreak-style': 'off',
//     "@typescript-eslint/no-use-before-define": ["error", { "functions": false}],
//     'no-shadow': 'off', // replaced by ts-eslint rule below
//     '@typescript-eslint/no-shadow': 'error',
//   }
// };

module.exports = {
  env: {
    node: true,
    browser: true,
    // es2021: true,
        jest: true,
  },
  plugins: ['@typescript-eslint/eslint-plugin', 'simple-import-sort', 'react'],
  extends: [
    'plugin:react/recommended',
    'airbnb',
  ],
  ignorePatterns: ['.eslintrc.js', '**/autoLayout.js', '**/heap.js'],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 12,
    sourceType: 'module',
  },
  rules: {
    'import/prefer-default-export': 0,
    'no-param-reassign': 0,
    'no-restricted-syntax': 0,
    'no-console': 0,
    'class-methods-use-this': 0,
    'max-classes-per-file': 0,
    'no-await-in-loop': 0,
    'no-underscore-dangle': ['error', { allow: ['_id', '__v', '__type', '__user', '__workspace'] }],
    'import/no-cycle': 0,
    'max-len': ['error', { 'code': 140 }],
    'simple-import-sort/imports': 'error',
    'simple-import-sort/exports': 'error',
    'import/no-extraneous-dependencies': ['error', {
      'devDependencies': ['**/*.spec.js', '**/*.e2e-spec.js', '**/*.spec.ts', '**/*.e2e-spec.ts']
    }],
    'arrow-parens': [2, 'as-needed', { 'requireForBlockBody': true }],
    'object-curly-newline': ['error', {
      ObjectExpression: { minProperties: 6, multiline: true, consistent: true },
      ObjectPattern: { minProperties: 6, multiline: true
        , consistent: true },
      ImportDeclaration: { minProperties: 6, multiline: true, consistent: true },
      ExportDeclaration: { minProperties: 6, multiline: true, consistent: true },
    }],
    "indent": "off",
    "arrow-body-style": ["always"],
    "@typescript-eslint/indent": ["error", 4],
    "@typescript-eslint/camelcase": "off",
    'import/extensions': ["error", "never"],
    'no-plusplus': 'off',
    "function-paren-newline": ["error", "multiline"],
    'linebreak-style': 'off',
    "@typescript-eslint/no-use-before-define": ["error", { "functions": false}],
    'no-shadow': 'off', // replaced by ts-eslint rule below
    '@typescript-eslint/no-shadow': 'error',
  }
};
