import eslintConfigBase from '@qwery/eslint-config/base.js';
import { defineConfig } from 'eslint/config';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

export default defineConfig(eslintConfigBase, {
  ignores: ['**/shadcn/**', '**/ai-elements/**'],
});
