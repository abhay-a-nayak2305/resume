import dotenv from 'dotenv';
import path from 'path';

// MUST BE FIRST: Load environment variables before any other imports
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import express from 'express';
import handler from './api/proxy';

const app = express();
app.use(express.json());

// Proxy route matching the Vite config
app.post('/api/proxy', async (req, res) => {
  try {
    await handler(req as any, res as any);
  } catch (error) {
    console.error('Proxy Server Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`
🚀 BACKEND SERVER RUNNING
-------------------------
URL: http://localhost:${PORT}
Proxy Endpoint: http://localhost:${PORT}/api/proxy
  `);
});
