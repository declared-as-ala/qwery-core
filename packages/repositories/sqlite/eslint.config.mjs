import baseConfig from '@qwery/eslint-config/base.js';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

export default [
  ...baseConfig,
  {
    ignores: ['dist/**', 'node_modules/**', 'coverage/**'],
  },
];

