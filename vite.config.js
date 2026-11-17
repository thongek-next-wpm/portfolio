import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Use relative base paths so the build works both at root (username.github.io)
// and in a repository subpath (username.github.io/portfolio/).
export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom'],
          three: ['three'],
        },
      },
    },
  },
});
