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

// Disable Express fingerprinting
app.disable('x-powered-by');

// Enterprise Security Headers
app.use((req, res, next) => {
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  next();
});

// Mount API router
app.use('/api', apiRouter);

// Unmatched API endpoint 404 handler (Structured JSON)
app.use('/api', (req, res) => {
  res.status(404).json({
    success: false,
    error: `API route '${req.method} ${req.originalUrl}' not found on AcademicLevel platform.`
  });
});

// Standalone Security Hall of Fame Direct Route
app.get(['/halloffame', '/halloffame/', '/halloffame.html'], (req, res) => {
  const standaloneFile = path.resolve(__dirname, '../public/halloffame/index.html');
  if (fs.existsSync(standaloneFile)) {
    return res.sendFile(standaloneFile);
  }
  const distFile = path.resolve(DIST_PATH, 'halloffame/index.html');
  if (fs.existsSync(distFile)) {
    return res.sendFile(distFile);
  }
  if (fs.existsSync(path.join(DIST_PATH, 'index.html'))) {
    return res.sendFile(path.join(DIST_PATH, 'index.html'));
  }
  res.status(404).send('Security Hall of Fame file not found.');
});

// Standalone Policies & Privacy Direct Route
app.get(['/policies', '/policies/', '/policies.html'], (req, res) => {
  const standaloneFile = path.resolve(__dirname, '../public/policies.html');
  if (fs.existsSync(standaloneFile)) {
    return res.sendFile(standaloneFile);
  }
  const distFile = path.resolve(DIST_PATH, 'policies.html');
  if (fs.existsSync(distFile)) {
    return res.sendFile(distFile);
  }
  if (fs.existsSync(path.join(DIST_PATH, 'index.html'))) {
    return res.sendFile(path.join(DIST_PATH, 'index.html'));
  }
  res.status(404).send('Policies page not found.');
});

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
