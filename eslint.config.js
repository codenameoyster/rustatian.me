import parser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import preact from 'eslint-plugin-preact';
import eslintPluginPrettier from 'eslint-plugin-prettier';
import prettier from 'eslint-config-prettier';

export default [
  {
    files: ['src/**/*.{ts,tsx}'],
    ignores: ['dist', 'node_modules'],
    languageOptions: {
      parser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      preact,
      prettier: eslintPluginPrettier,
    },
    rules: {
      ...(tsPlugin.configs.recommended?.rules ?? {}),
      'preact/no-unknown-property': 'off',
      'prettier/prettier': 'error',
    },
  },
  prettier,
];
