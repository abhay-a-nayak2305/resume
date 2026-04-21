# Pinecone Database Setup Guide

## Quick Start

1. **Create Pinecone Account**
   - Go to https://pinecone.io
   - Create a free account
   - Create an index with:
     - Name: `resume-ai` (or your preferred name)
     - Dimension: `1536` (matches OpenAI embeddings)
     - Metric: `cosine`
     - Environment: Select your preferred region

2. **Configure Environment Variables**
   Add these to your root `.env` file:
   ```
   PINECONE_API_KEY=your_api_key_here
   PINECONE_INDEX_NAME=resume-ai
   OPENAI_API_KEY=your_openai_api_key
   ```

3. **Seed the Database**
   ```bash
   # Install dependencies
   cd backend
   npm install

   # Run seed script
   npx ts-node scripts/seed-pinecone.ts
   ```

## Adding Your Own Resumes

### Option 1: Modify Seed Script
Edit `scripts/seed-pinecone.ts` and add your resumes to the `sampleResumes` array.

### Option 2: Use Client-Side Upload
Import and use the uploader:
```typescript
import { uploadResumeToPinecone } from './lib/pinecone-uploader';

await uploadResumeToPinecone(resumeText, {
  role: 'Software Engineer',
  industry: 'Tech',
  atsScore: 85
});
```

### Option 3: Bulk Upload from Directory
Place text files in a `resumes/` directory and use:
```typescript
import { batchUploadResumes } from './lib/pinecone-uploader';
```

## Namespaces Used
- `resumes`: For similar resume examples
- `knowledge`: For best practices and guidelines

## Troubleshooting

**Index not ready:** Wait 2-3 minutes after creating the index.

**Rate limits:** Add delays between API calls (already implemented in seed script).

**Dimension mismatch:** Ensure your index uses 1536 dimensions for OpenAI embeddings.

**Authentication errors:** Verify API keys and index name in `.env`.
