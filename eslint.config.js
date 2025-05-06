import tseslint from 'typescript-eslint';
import preact from 'eslint-plugin-preact';
import prettier from 'eslint-config-prettier';
import eslintPluginPrettier from 'eslint-plugin-prettier';

export default tseslint.config(
  {
    files: ['src/**/*.{ts,tsx}'],
    ignores: ['node_modules', 'dist'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: {
      preact,
      prettier: eslintPluginPrettier,
    },
    rules: {
      'preact/no-unknown-property': 'off',
      'prettier/prettier': 'error'
    },
  },
  prettier
);
