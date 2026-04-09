// @ts-check
import eslint from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
    {
        ignores: ['eslint.config.mjs', 'dist/**/*', 'node_modules/**/*', '**/*.raw.js', 'scripts/**/*'],
    },
    eslint.configs.recommended,
    ...tseslint.configs.recommendedTypeChecked,
    eslintPluginPrettierRecommended,
    {
        languageOptions: {
            globals: {
                ...globals.node,
                ...globals.jest,
            },
            ecmaVersion: 2022,
            sourceType: 'module',
            parserOptions: {
                projectService: true,
                tsconfigRootDir: import.meta.dirname,
            },
        },
    },
    {
        rules: {
            // TypeScript specific rules
            '@typescript-eslint/no-explicit-any': 'warn',
            '@typescript-eslint/no-floating-promises': 'warn',
            '@typescript-eslint/no-unsafe-argument': 'warn',
            '@typescript-eslint/no-unsafe-assignment': 'off',
            '@typescript-eslint/no-unsafe-call': 'off',
            '@typescript-eslint/no-unsafe-member-access': 'off',
            '@typescript-eslint/no-unsafe-return': 'off',
            '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
            '@typescript-eslint/explicit-function-return-type': 'off',
            '@typescript-eslint/explicit-module-boundary-types': 'off',
            '@typescript-eslint/no-empty-function': 'warn',
            '@typescript-eslint/no-var-requires': 'error',

            // NestJS specific rules
            '@typescript-eslint/no-empty-interface': 'warn',
            '@typescript-eslint/interface-name-prefix': 'off',
            '@typescript-eslint/no-inferrable-types': 'warn',

            // General rules
            'prefer-const': 'error',
            'no-var': 'error',
            'no-console': 'warn',
            'no-debugger': 'error',
            'no-duplicate-imports': 'error',
            'no-unused-expressions': 'error',
            'prefer-template': 'error',
            'object-shorthand': 'error',
            'prefer-arrow-callback': 'error',

            // Prettier: 프로젝트 .prettierrc(tabWidth 4 등)가 로드되도록 플러그인 유지, 스타일 충돌은 경고로 완화
            'prettier/prettier': 'off',
        },
    },
);
