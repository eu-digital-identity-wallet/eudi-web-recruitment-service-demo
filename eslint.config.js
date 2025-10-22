// eslint.config.js (Flat config)
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';
import functional from 'eslint-plugin-functional';
import importPlugin from 'eslint-plugin-import';
import unusedImports from 'eslint-plugin-unused-imports';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
	baseDirectory: __dirname,
});

export default [
	{
		ignores: [
			'node_modules/**',
			'.next/**',
			'out/**',
			'build/**',
			'next-env.d.ts',
			'**/*.config.js',
			'**/*.config.mjs',
			'**/*.config.ts',
		],
	},
	// Base JS / TS support
	js.configs.recommended,
	...tseslint.configs.recommended, // Use recommended instead of recommendedTypeChecked for less strictness
	// Next.js rules (using compat for legacy config)
	...compat.extends('next/core-web-vitals', 'next/typescript'),
	// Plugins
	{
		plugins: {
			functional,
			import: importPlugin,
			'unused-imports': unusedImports,
		},
		languageOptions: {
			parserOptions: {
				project: ['./tsconfig.json'],
				tsconfigRootDir: process.cwd(),
			},
		},
		settings: {
			'import/resolver': {
				typescripts: true,
				node: true,
			},
		},
		rules: {
			// Functional style (relaxed for practicality)
			'functional/immutable-data': 'off', // Too strict for typical Next.js apps
			'functional/no-let': 'off', // Allow let for practical use
			'functional/prefer-readonly-type': 'off',
			'functional/no-classes': 'off', // Classes are common in services/DI
			'functional/no-try-statement': 'off',

			// TS best practices
			'@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
			'@typescript-eslint/no-unused-vars': 'off', // replaced by unused-imports
			'unused-imports/no-unused-imports': 'error',
			'unused-imports/no-unused-vars': [
				'warn',
				{ args: 'after-used', argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
			],

			// Imports hygiene
			'import/order': [
				'warn',
				{
					groups: ['builtin', 'external', 'internal', ['parent', 'sibling', 'index'], 'type'],
					'newlines-between': 'always',
					alphabetize: { order: 'asc', caseInsensitive: true },
				},
			],

			// React / Next niceties
			'react/jsx-boolean-value': ['warn', 'never'],
			'react/self-closing-comp': 'warn',
			'@next/next/no-html-link-for-pages': 'off', // if using app router only
		},
	},

	// Make Prettier the source of truth for formatting
	{
		name: 'prettier-compat',
		ignores: ['**/*.yml', '**/*.yaml'], // Prettier override handles spaces there
		...prettier,
	},

	// Test & config file overrides
	{
		files: ['**/*.test.*', '**/*.spec.*', 'vitest.config.*', 'jest.config.*'],
		rules: {
			'functional/no-try-statement': 'off',
			'functional/no-let': 'off',
		},
	},
];
