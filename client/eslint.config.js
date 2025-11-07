// eslint.config.js
import nextPlugin from '@next/eslint-plugin-next'
import prettierPlugin from 'eslint-config-prettier'

/** @type {import('eslint').Linter.FlatConfig[]} */
export default [
  {
    ignores: ['node_modules', '.next', 'out', 'dist'],
  },
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    plugins: {
      '@next/next': nextPlugin,
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      'import/prefer-default-export': 'off',
      'no-console': 'warn',
      'no-var': 'error',
      'no-html-link-for-pages': 'off',
    },
  },
  prettierPlugin,
]
