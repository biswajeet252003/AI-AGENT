import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // Ensures process.env usage in the code doesn't crash the browser.
    // When building on a platform like Vercel, this can be configured to map actual env vars.
    'process.env': {} 
  }
});