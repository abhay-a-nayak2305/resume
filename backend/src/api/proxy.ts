import { VercelRequest, VercelResponse } from '@vercel/node';
import OpenAI from 'openai';
import { Pinecone } from '@pinecone-database/pinecone';
import axios from 'axios';
import * as cheerio from 'cheerio';
import cors from 'cors';
import { validateEnv } from '../lib/env';
import { 
  embeddingsSchema, 
  pineconeQuerySchema, 
  pineconeUpsertSchema,
  chatCompletionSchema,
  linkedInImportSchema,
  validateBody 
} from '../lib/validation';
import { handleError, ValidationError, RateLimitError, InternalServerError } from '../lib/errors';
import { logger } from '../lib/logger';

// Validate environment on startup
validateEnv();

const corsMiddleware = cors({ 
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.ALLOWED_ORIGINS?.split(',') || [] 
    : true,
  credentials: true,
  maxAge: 86400
});

// Rate limiting - 10 requests per IP per minute
const rateLimit = new Map<string, { count: number, reset: number }>();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 10;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  
  if (!rateLimit.has(ip) || rateLimit.get(ip)!.reset < now) {
    rateLimit.set(ip, { count: 1, reset: now + RATE_LIMIT_WINDOW });
    return true;
  }

  const data = rateLimit.get(ip)!;
  if (data.count >= MAX_REQUESTS_PER_WINDOW) return false;
  
  data.count++;
  return true;
}

// Sanitize output to prevent XSS
function sanitizeOutput<T>(data: T): T {
  if (typeof data === 'string') {
    return data
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '') as unknown as T;
  }
  
  if (Array.isArray(data)) {
    return data.map(sanitizeOutput) as unknown as T;
  }
  
  if (data && typeof data === 'object') {
    return Object.fromEntries(
      Object.entries(data).map(([key, value]) => [key, sanitizeOutput(value)])
    ) as unknown as T;
  }
  
  return data;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const startTime = Date.now();
  const ip = req.headers['x-forwarded-for'] as string || 'unknown';
  
  corsMiddleware(req, res, async () => {
    // Security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Content-Security-Policy', "default-src 'self'");
    
    logger.info('Request received', { 
      method: req.method, 
      action: req.body?.action,
      ip 
    });

    // Health check endpoint
    if (req.method === 'GET' && req.url?.includes('health')) {
      return res.status(200).json({ 
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: process.env.npm_package_version || '1.0.0'
      });
    }

    if (!checkRateLimit(ip)) {
      logger.warn('Rate limit exceeded', { ip });
      const error = handleError(new RateLimitError());
      return res.status(error.statusCode).json(error.body);
    }

    try {
      if (req.method !== 'POST') {
        throw new ValidationError('Method not allowed');
      }

      const { action, ...params } = req.body;
      
      if (!action) {
        throw new ValidationError('Action is required');
      }

      logger.debug('Processing action', { action });

      let response: unknown;
      
      switch (action) {
        case 'chat.completions': {
          const validated = validateBody(req, chatCompletionSchema);
          const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
          response = await openai.chat.completions.create(validated);
          break;
        }

        case 'embeddings.create': {
          const validated = validateBody(req, embeddingsSchema);
          const { data } = await axios.post('https://openrouter.ai/api/v1/embeddings', {
            model: 'nvidia/llama-nemotron-embed-vl-1b-v2:free',
            input: validated.input
          }, {
            headers: {
              'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
              'Content-Type': 'application/json'
            }
          });
          response = data;
          break;
        }

        case 'pinecone.query': {
          const validated = validateBody(req, pineconeQuerySchema);
          const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });
          const index = pinecone.index(process.env.PINECONE_INDEX_NAME!);
          response = await index.query(validated);
          break;
        }

        case 'linkedin.import': {
          const validated = validateBody(req, linkedInImportSchema);
          const { data } = await axios.get(validated.profileUrl, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            },
            timeout: 10000
          });
          
          const $ = cheerio.load(data);
          response = {
            name: sanitizeOutput($('.top-card-layout__title').text().trim()),
            headline: sanitizeOutput($('.top-card-layout__headline').text().trim()),
            location: sanitizeOutput($('.top-card-layout__first-line__location').text().trim()),
            experience: $('.experience-item').map(function() {
              return {
                title: sanitizeOutput($(this).find('.experience-item__title').text().trim()),
                company: sanitizeOutput($(this).find('.experience-item__subtitle').text().trim()),
                description: sanitizeOutput($(this).find('.experience-item__description').text().trim()),
              };
            }).get()
          };
          break;
        }

        case 'pinecone.upsert': {
          const validated = validateBody(req, pineconeUpsertSchema);
          const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });
          const index = pinecone.index(process.env.PINECONE_INDEX_NAME!);
          response = await index.upsert(validated as any);
          break;
        }

        default:
          throw new ValidationError(`Unknown action: ${action}`);
      }

      const sanitizedResponse = sanitizeOutput(response);
      
      logger.info('Request completed', { 
        action, 
        duration: Date.now() - startTime,
        status: 200
      });

      return res.status(200).json(sanitizedResponse);

    } catch (error) {
      const { statusCode, body } = handleError(error);
      
      logger.error('Request failed', {
        action: req.body?.action,
        error: body.error,
        duration: Date.now() - startTime,
        status: statusCode
      });

      return res.status(statusCode).json(body);
    }
  });
}
