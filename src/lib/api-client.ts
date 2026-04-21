import { z } from 'zod';

const PROXY_URL = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL}/api/proxy`
  : '/api/proxy';

const apiErrorSchema = z.object({
  error: z.string(),
  details: z.string().optional()
});

export class ApiError extends Error {
  statusCode: number;
  details?: string;

  constructor(message: string, statusCode: number, details?: string) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.name = 'ApiError';
  }
}

async function handleResponse<T>(response: Response, schema?: z.ZodSchema<T>): Promise<T> {
  const data = await response.json();

  if (!response.ok) {
    const errorResult = apiErrorSchema.safeParse(data);
    throw new ApiError(
      errorResult.success ? errorResult.data.error : 'Request failed',
      response.status,
      errorResult.success ? errorResult.data.details : undefined
    );
  }

  if (schema) {
    const result = schema.safeParse(data);
    if (!result.success) {
      console.error('Invalid API response:', result.error);
      throw new ApiError('Invalid server response', 500);
    }
    return result.data;
  }

  return data as T;
}

export async function apiRequest<T>(
  action: string, 
  params: Record<string, any>, 
  schema?: z.ZodSchema<T>
): Promise<T> {
  const response = await fetch(PROXY_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, ...params }),
    credentials: 'include'
  });

  return handleResponse(response, schema);
}

// Type-safe API methods
export const api = {
  generateEmbeddings: (input: string) => 
    apiRequest('embeddings.create', { input }), // CHANGED 'text' to 'input'
  
  searchResumes: (vector: number[], topK = 5) =>
    apiRequest('pinecone.query', { vector, topK }), // CHANGED 'embedding' to 'vector'
  
  chatCompletion: (messages: Array<{ role: string; content: string }>, options = {}) =>
    apiRequest('chat.completions', { messages, ...options }),
  
  importLinkedIn: (profileUrl: string) =>
    apiRequest('linkedin.import', { profileUrl })
};