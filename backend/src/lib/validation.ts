import { z, ZodSchema } from 'zod';
import { VercelRequest } from '@vercel/node';
import { ValidationError } from './errors';

export const embeddingsSchema = z.object({
  model: z.string().optional().default('text-embedding-ada-002'),
  input: z.string().min(1, 'Input text is required')
});

export const pineconeQuerySchema = z.object({
  vector: z.array(z.number()),
  topK: z.number().int().min(1).max(100).default(5),
  namespace: z.string().optional(),
  includeMetadata: z.boolean().default(true)
});

export const pineconeUpsertSchema = z.object({
  records: z.array(z.object({
    id: z.string(),
    values: z.array(z.number()),
    metadata: z.object({}).catchall(z.unknown()).optional()
  }))
});

export const chatCompletionSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(['system', 'user', 'assistant']),
    content: z.string()
  })),
  model: z.string().default('gpt-3.5-turbo'),
  temperature: z.number().min(0).max(2).default(0.7),
  max_tokens: z.number().int().min(1).max(4096).optional()
});

export const linkedInImportSchema = z.object({
  profileUrl: z.string().url('Valid LinkedIn URL required')
});

export function validateBody<T>(req: VercelRequest, schema: ZodSchema<T>): T {
  const result = schema.safeParse(req.body);
  
  if (!result.success) {
    const errors = result.error.issues.map(issue => 
      `${issue.path.join('.')}: ${issue.message}`
    );
    throw new ValidationError(errors.join(', '));
  }

  return result.data;
}

