import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import stylistic from '@stylistic/eslint-plugin';

export default [
  js.configs.recommended,

  ...tseslint.configs.recommended,

  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tseslint.parser
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin
    },
    rules: {
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }]
    }
  },

  {
    plugins: {
      '@stylistic': stylistic
    },
    rules: {
      '@stylistic/max-len': ['warn', { code: 120 }],
      'sort-imports': ['warn', {}]
    }
  },

  {
    files: ['**/*.test.js', '**/*.test.jsx'],
    languageOptions: {
      globals: globals.jest
    }
  }
];
