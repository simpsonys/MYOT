import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // In dev, proxy /api calls to local vercel dev or fallback
    // For Vercel deployment, the /api folder is auto-mapped to serverless functions
  },
});
