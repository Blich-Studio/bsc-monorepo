import eslint from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import vuePlugin from 'eslint-plugin-vue';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import vueParser from 'vue-eslint-parser';

const baseConfig = [
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      '*.config.js',
      '*.config.mjs',
      '*.config.ts',
      'coverage/**',
      '.turbo/**',
    ],
  },
  eslint.configs.recommended,
  eslintPluginPrettierRecommended,
];

const typescriptConfig = [
  {
    files: ['**/*.ts', '**/*.tsx'],
    extends: [...tseslint.configs.recommendedTypeChecked, ...tseslint.configs.stylisticTypeChecked],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
    rules: {
      // Modern TypeScript best practices
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/prefer-nullish-coalescing': 'error',
      '@typescript-eslint/prefer-optional-chain': 'error',
      '@typescript-eslint/no-unnecessary-condition': 'error',
      '@typescript-eslint/no-confusing-void-expression': 'error',
      '@typescript-eslint/prefer-as-const': 'error',
      '@typescript-eslint/no-non-null-assertion': 'warn',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/await-thenable': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
      '@typescript-eslint/require-await': 'error',
      '@typescript-eslint/no-unused-expressions': 'error',
      '@typescript-eslint/prefer-destructuring': 'error',
      '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
      '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
      '@typescript-eslint/array-type': ['error', { default: 'array-simple' }],
      '@typescript-eslint/member-ordering': [
        'error',
        {
          default: ['signature', 'field', 'constructor', 'method'],
        },
      ],
    },
  },
];

export const base = (options = {}) => tseslint.config(...baseConfig, ...typescriptConfig, options);

export const nestjs = (options = {}) =>
  tseslint.config(
    ...baseConfig,
    ...typescriptConfig,
    {
      languageOptions: {
        globals: {
          ...globals.node,
          ...globals.jest,
        },
      },
      rules: {
        // NestJS specific overrides
        '@typescript-eslint/interface-name-prefix': 'off',
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-floating-promises': 'warn', // Less strict for controllers
      },
    },
    options
  );

export const adonisjs = (options = {}) =>
  tseslint.config(
    ...baseConfig,
    ...typescriptConfig,
    {
      languageOptions: {
        globals: {
          ...globals.node,
          ...globals.jest,
        },
      },
      rules: {
        '@typescript-eslint/no-unused-vars': [
          'error',
          {
            argsIgnorePattern: '^_',
            varsIgnorePattern: '^_',
            caughtErrorsIgnorePattern: '^_',
          },
        ],
        '@typescript-eslint/no-floating-promises': 'warn', // AdonisJS often uses async without await
      },
    },
    options
  );

export const vue = (options = {}) =>
  tseslint.config(
    ...baseConfig,
    ...vuePlugin.configs['flat/recommended'],
    {
      files: ['**/*.vue'],
      languageOptions: {
        parser: vueParser,
        parserOptions: {
          parser: '@typescript-eslint/parser',
          sourceType: 'module',
          project: false, // Disable type checking for Vue files
          extraFileExtensions: ['.vue'],
          ecmaVersion: 'latest',
          ecmaFeatures: {
            jsx: true,
          },
        },
        globals: {
          ...globals.browser,
        },
      },
      rules: {
        // Vue 3 best practices
        'vue/multi-word-component-names': 'off', // Allow single word names
        'vue/no-unused-vars': 'error',
        'vue/no-unused-components': 'error',
        'vue/require-v-for-key': 'error',
        'vue/no-use-v-if-with-v-for': 'error',
        'vue/no-dupe-keys': 'error',
        'vue/no-duplicate-attributes': 'error',
        'vue/no-side-effects-in-computed-properties': 'error',
        'vue/return-in-computed-property': 'error',
        'vue/no-async-in-computed-properties': 'error',
        'vue/no-dupe-v-else-if': 'error',
        'vue/valid-v-else': 'error',
        'vue/valid-v-else-if': 'error',
        'vue/valid-v-if': 'error',
        'vue/valid-v-for': 'error',
        'vue/valid-v-model': 'error',
        'vue/valid-v-on': 'error',
        'vue/valid-v-bind': 'error',
        'vue/valid-v-slot': 'error',
        'vue/no-lifecycle-after-await': 'error',
        'vue/no-v-html': 'warn', // Warn about v-html usage
        'vue/no-template-target-blank': 'error',
        'vue/no-mutating-props': 'error',
        'vue/require-explicit-emits': 'error',
        'vue/prefer-import-from-vue': 'error',
        'vue/no-ref-object-destructure': 'error',
        'vue/no-computed-properties-in-data': 'error',
        'vue/no-watch-after-await': 'error',
        'vue/component-api-style': ['error', ['script-setup', 'composition']],
        'vue/component-options-name-casing': ['error', 'PascalCase'],
        'vue/custom-event-name-casing': ['error', 'camelCase'],
        'vue/define-emits-declaration': 'error',
        'vue/define-props-declaration': 'error',
        'vue/next-tick-style': ['error', 'promise'],
        'vue/prefer-true-attribute-shorthand': 'error',
        'vue/v-on-event-hyphenation': ['error', 'never'],
        'vue/v-bind-style': ['error', 'shorthand'],
        'vue/v-on-style': ['error', 'shorthand'],
        'vue/v-slot-style': ['error', 'shorthand'],
      },
    },
    options
  );
