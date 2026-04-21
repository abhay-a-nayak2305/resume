import { z } from 'zod';

const envSchema = z.object({
  OPENAI_API_KEY: z.string().min(1, 'OPENAI_API_KEY is required'),
  PINECONE_API_KEY: z.string().min(1, 'PINECONE_API_KEY is required'),
  PINECONE_INDEX_NAME: z.string().min(1, 'PINECONE_INDEX_NAME is required'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3001)
});

export type Env = z.infer<typeof envSchema>;

export function validateEnv() {
  const result = envSchema.safeParse(process.env);
  
  if (!result.success) {
    const errors = result.error.issues.map(issue => 
      `❌ ${issue.path.join('.')}: ${issue.message}`
    ).join('\n');
    
    throw new Error(`Environment validation failed:\n${errors}`);
  }

  return result.data;
}

// Validate environment on module load
export const env = validateEnv();