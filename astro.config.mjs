import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

export default defineConfig({
  site: 'https://light24-arch.github.io',
  base: '/',
  integrations: [react()],
  output: 'static',
});
