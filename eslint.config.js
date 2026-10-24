import js from '@eslint/js';
import globals from 'globals';

export default [
  {
    ignores: [
      '.state/**',
      'inbox/**',
      'node_modules/**',
      'scripts/wiki/**',
      'web/brain/dist/**',
      'web/brain/node_modules/**',
      'wiki/**',
    ],
  },
  js.configs.recommended,
  {
    files: ['**/*.{js,mjs,cjs}'],
    languageOptions: {
      ecmaVersion: 2025,
      sourceType: 'module',
      globals: globals.node,
    },
    rules: {
      'no-console': 'off',
      'no-unused-vars': ['error', { ignoreRestSiblings: true }],
    },
  },
  {
    files: ['**/*.cjs'],
    languageOptions: { sourceType: 'commonjs' },
  },
  {
    files: ['web/brain/**/*.js'],
    languageOptions: { globals: globals.browser },
  },
];
