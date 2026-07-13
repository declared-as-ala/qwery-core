import eslintConfigApps from '@qwery/eslint-config/apps.js';
import eslintConfigBase from '@qwery/eslint-config/base.js';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

export default [
  ...eslintConfigBase,
  ...eslintConfigApps,
];
