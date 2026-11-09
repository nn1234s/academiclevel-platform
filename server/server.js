import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import { apiRouter } from './api.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const DIST_PATH = path.resolve(__dirname, '../dist');

// Mount API router
app.use('/api', apiRouter);

// Serve production static assets if dist exists
if (fs.existsSync(DIST_PATH)) {
  app.use(express.static(DIST_PATH));

  // SPA fallback for all GET requests outside /api
  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.url.startsWith('/api')) {
      return res.sendFile(path.join(DIST_PATH, 'index.html'));
    }
    next();
  });
}

export { app };

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`====================================================`);
    console.log(`🚀 ACADEMICLEVEL ENTERPRISE SERVER RUNNING`);
    console.log(`🔗 Local Address: http://localhost:${PORT}/`);
    console.log(`📦 Database: SQLite ACID (server/data/academiclevel_prod.db)`);
    console.log(`🛡️ Super-Admin Route: /adminservice (Protected)`);
    console.log(`====================================================`);
  });
}
