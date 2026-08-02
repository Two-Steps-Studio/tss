// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from "eslint-plugin-storybook";

import { FlatCompat } from '@eslint/eslintrc'

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
})

const eslintConfig = [...compat.config({
  extends: ['next/core-web-vitals'],
  plugins: ['import', '@typescript-eslint'],
}), {
  rules: {
    'react/no-unescaped-entities': 'off',
    '@next/next/no-img-element': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    'react-hooks/exhaustive-deps': 'off',
    'import/no-unresolved': 'off',
    'import/named': 'off',
    'import/default': 'off',
    'import/namespace': 'off',
    'import/no-absolute-path': 'off',
    'import/no-dynamic-require': 'off',
    'import/no-self-import': 'off',
    'import/no-cycle': 'off',
    'import/no-useless-path-segments': 'off',
  },
}, ...storybook.configs["flat/recommended"]]

export default eslintConfig