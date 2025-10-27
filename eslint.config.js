// eslint.config.js (ESLint v9+ flat config)
import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import stylistic from '@stylistic/eslint-plugin';

export default [
  // Base JS rules (equivalent to "eslint:recommended")
  js.configs.recommended,

  // TypeScript recommended rules
  ...tseslint.configs.recommended,

  // Project-specific rules and settings
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

  // Global rules/plugins (apply to all files unless overridden above)
  {
    plugins: {
      '@stylistic': stylistic
    },
    rules: {
      '@stylistic/max-len': ['warn', { code: 120 }],
      'sort-imports': ['warn', {}]
    }
  },

  // Test files (Jest globals)
  {
    files: ['**/*.test.js', '**/*.test.jsx'],
    languageOptions: {
      globals: globals.jest
    }
  }
];
