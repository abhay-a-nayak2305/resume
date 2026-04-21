import { Hono } from 'hono';
import { cors } from 'hono/cors';
import handler from './api/proxy';

const app = new Hono().basePath('/api');

// Enable CORS
app.use('*', cors());

// Health check
app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Proxy route matching the Vite config
app.post('/proxy', async (c) => {
  const body = await c.req.json();
  
  // Create a mock request/response for the existing handler
  // or better, adapt the handler to Hono.
  // For now, we'll pass the Hono context if we refactor proxy.ts
  
  // We'll refactor proxy.ts to export a Hono-compatible function
  // but for a quick fix, let's just implement the logic here or adapt it.
  
  try {
    const result = await handler(body, c.env);
    return c.json(result);
  } catch (error: any) {
    console.error('Worker Error:', error);
    return c.json({ error: error.message || 'Internal Server Error' }, 500);
  }
});

export default app;
