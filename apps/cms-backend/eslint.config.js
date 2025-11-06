import { adonisjs } from '@blich-studio/eslint-config';

export default adonisjs({
  ignores: ['ace.js'],
  languageOptions: {
    parserOptions: {
      project: './tsconfig.json',
      tsconfigRootDir: import.meta.dirname,
    },
  },
});
