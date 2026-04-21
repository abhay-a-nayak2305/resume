// All AI operations now use FREE OpenRouter models
// No OpenAI billing required for any functionality

const PROXY_URL = typeof window !== 'undefined' ? '/api/proxy' : 'http://localhost:3000/api/proxy';

export async function generateEmbeddings(text: string): Promise<number[]> {
  try {
    const sanitizedText = text.replace(/\n/g, ' ').slice(0, 8192);
    
    const response = await fetch('https://openrouter.ai/api/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'nvidia/llama-nemotron-embed-vl-1b-v2:free', // MATCHES SEED (2048 dims)
        input: sanitizedText
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Embedding failed: ${error.error?.message || response.statusText}`);
    }
    
    const data = await response.json();
    return data.data[0].embedding;
  } catch (error) {
    console.error('Embedding generation failed:', error);
    throw new Error('Failed to generate embeddings');
  }
}

export async function searchSimilarResumes(queryEmbedding: number[], topK: number = 5) {
  try {
    const response = await fetch(PROXY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'pinecone.query',
        vector: queryEmbedding, // CHANGED FROM 'embedding'
        topK,
        namespace: 'resumes'
      })
    });

    if (!response.ok) throw new Error('Search failed');
    
    const data = await response.json();
    return data.matches;
  } catch (error) {
    console.error('Pinecone search failed:', error);
    return [];
  }
}

export async function searchKnowledgeBase(queryEmbedding: number[], category?: string) {
  try {
    const response = await fetch(PROXY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'pinecone.query',
        vector: queryEmbedding, // CHANGED FROM 'embedding'
        topK: 10,
        category,
        namespace: 'resumes' // CHANGED FROM 'knowledge' TO MATCH SEED
      })
    });

    if (!response.ok) throw new Error('Search failed');
    
    const data = await response.json();
    return data.matches;
  } catch (error) {
    console.error('Knowledge base search failed:', error);
    return [];
  }
}

export async function analyzeResumeWithRAG(resumeText: string) {
  const embedding = await generateEmbeddings(resumeText);
  
  const [knowledgeResults, resumeResults] = await Promise.all([
    searchKnowledgeBase(embedding),
    searchSimilarResumes(embedding)
  ]);
  
  return {
    knowledge: knowledgeResults,
    similarResumes: resumeResults
  };
}

// AI chat completion now uses FREE OpenRouter model - NO OpenAI needed
export async function createChatCompletion(messages: any[], options: any = {}) {
  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': window?.location?.origin || 'http://localhost:3000',
        'X-Title': 'Resume.AI'
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-3-8b-instruct', // FREE on OpenRouter
        messages,
        temperature: options.temperature || 0.7,
        response_format: options.response_format
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Chat completion failed: ${error.error?.message || response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('AI analysis failed:', error);
    throw error;
  }
}

export { createChatCompletion as openai };
