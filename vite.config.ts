import { defineConfig } from 'vite'

export default defineConfig({
  base: '/pixijs-image-maker/',
  resolve: {
    alias: {
      '@': '/src',
    },
  },
})
