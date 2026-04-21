import { VercelRequest, VercelResponse } from '@vercel/node';
import cors from 'cors';

const corsMiddleware = cors({ origin: true });

export default async function handler(req: VercelRequest, res: VercelResponse) {
  corsMiddleware(req, res, () => {
    return res.json({
      message: 'Resume AI Proxy Server',
      endpoints: ['/api/proxy'],
      rateLimit: '10 requests per minute per IP'
    });
  });
}
