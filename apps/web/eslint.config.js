import { vue } from '@blich-studio/eslint-config';

export default vue({
  languageOptions: {
    parserOptions: {
      project: './tsconfig.app.json',
      tsconfigRootDir: import.meta.dirname,
    },
  },
});
