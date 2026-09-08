import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs';

export default defineConfig({
  plugins: [react(), {
    name: 'heritage-api',
    configureServer(server) {
      server.middlewares.use('/api/monuments', (req, res, next) => {
        res.setHeader('Content-Type', 'application/json');
        if (req.url === '/' || req.url === '') return res.end(fs.readFileSync('public/api/monuments.json'));
        if (req.url.includes('konark-sun-temple')) return res.end(fs.readFileSync('public/api/monument-detail.json'));
        return next();
      });
    }
  }],
  server: { port: 5173 }
});
