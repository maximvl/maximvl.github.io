import { resolve } from 'node:path';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  appType: 'mpa',
  plugins: [tailwindcss(), svelte()],
  build: {
    rollupOptions: {
      input: {
        home: resolve(import.meta.dirname, 'index.html'),
        mods: resolve(import.meta.dirname, 'mods/index.html')
      }
    }
  }
});
