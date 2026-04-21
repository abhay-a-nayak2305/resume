import { generateEmbeddings } from './pinecone';

export async function uploadResumeToPinecone(resumeText: string, metadata: Record<string, any> = {}) {
  try {
    // Uses FREE OpenRouter embeddings automatically
    const embedding = await generateEmbeddings(resumeText);
    
    const vector = {
      id: `resume-${Date.now()}`,
      values: embedding,
      metadata: {
        content: resumeText,
        source: 'user_upload',
        uploadedAt: new Date().toISOString(),
        ...metadata
      }
    };

    const response = await fetch('/api/proxy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'pinecone.upsert',
        records: [vector]
      })
    });

    if (!response.ok) throw new Error('Failed to upload resume');
    
    return await response.json();
  } catch (error) {
    console.error('Upload failed:', error);
    throw error;
  }
}

export async function batchUploadResumes(resumes: Array<{ text: string; metadata: Record<string, any> }>) {
  const results = [];
  
  for (const resume of resumes) {
    try {
      const result = await uploadResumeToPinecone(resume.text, resume.metadata);
      results.push({ success: true, result });
    } catch (error) {
      results.push({ success: false, error });
    }
    
    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  
  return results;
}
