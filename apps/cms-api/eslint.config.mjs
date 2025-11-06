import { base } from '@blich-studio/eslint-config';

export default base({
  languageOptions: {
    parserOptions: {
      project: './tsconfig.json',
      tsconfigRootDir: import.meta.dirname,
    },
  },
});
