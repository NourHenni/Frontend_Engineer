import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 4000, // Change the port to 4000
    open: true, // Automatically open the browser when running `npm run dev`
    cors: true, // Enable CORS if needed
  },
  build: {
    outDir: 'dist', // Output directory for the build
    sourcemap: true, // Generate source maps for debugging
  },
});
