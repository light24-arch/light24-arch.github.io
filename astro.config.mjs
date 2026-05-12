import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  site: 'https://light24-arch.github.io',
  base: '/',
  integrations: [react({ jsxImportSource: 'react' }), tailwind()],
  output: 'static',
  experimental: {
    contentIntellisense: true,
  },
});
