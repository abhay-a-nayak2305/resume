import OpenAI from 'openai';
import { Pinecone } from '@pinecone-database/pinecone';
import * as cheerio from 'cheerio';
import { 
  embeddingsSchema, 
  pineconeQuerySchema, 
  pineconeUpsertSchema,
  chatCompletionSchema,
  linkedInImportSchema 
} from '../lib/validation';

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

export default async function handler(body: any, env: any) {
  const { action, ...params } = body;
  
  if (!action) {
    throw new Error('Action is required');
  }

  let response: unknown;
  
  switch (action) {
    case 'chat.completions': {
      const validated = chatCompletionSchema.parse(params);
      const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY || env.VITE_OPENROUTER_API_KEY });
      response = await openai.chat.completions.create(validated as any);
      break;
    }

    case 'embeddings.create': {
      const validated = embeddingsSchema.parse(params);
      const res = await fetch('https://openrouter.ai/api/v1/embeddings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.OPENROUTER_API_KEY || env.VITE_OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'nvidia/llama-nemotron-embed-vl-1b-v2:free',
          input: validated.input
        })
      });
      response = await res.json();
      break;
    }

    case 'pinecone.query': {
      const validated = pineconeQuerySchema.parse(params);
      const pinecone = new Pinecone({ apiKey: env.PINECONE_API_KEY });
      const index = pinecone.index(env.PINECONE_INDEX_NAME);
      response = await index.query(validated);
      break;
    }

    case 'linkedin.import': {
      const validated = linkedInImportSchema.parse(params);
      const res = await fetch(validated.profileUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });
      const data = await res.text();
      
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
      const validated = pineconeUpsertSchema.parse(params);
      const pinecone = new Pinecone({ apiKey: env.PINECONE_API_KEY });
      const index = pinecone.index(env.PINECONE_INDEX_NAME);
      response = await index.upsert(validated as any);
      break;
    }

    default:
      throw new Error(`Unknown action: ${action}`);
  }

  return sanitizeOutput(response);
}
