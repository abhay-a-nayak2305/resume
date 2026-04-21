# Resume Seeding System

✅ Setup complete! You now have everything needed to seed 1000+ resumes.

## Next Steps

1. **Replace the sample dataset**:
   - Download real datasets from:
     - https://www.kaggle.com/datasets/snehaanbhawal/resume-dataset (2484 resumes)
     - https://github.com/yangshun/tech-interview-handbook/tree/master/resume (FAANG resumes)
   - Format as JSON array with `{ text: string, role?: string, yearsExperience?: number }`
   - Replace the content in `scripts/resume-dataset.json`

2. **Install tsx**:
   ```bash
   npm install tsx -g
   ```

3. **Run the seeder**:
   ```bash
   tsx scripts/seed-resumes.ts
   ```

## What this does:
- ✅ Automatically filters out low quality resumes
- ✅ Generates OpenAI embeddings for each resume
- ✅ Batch uploads to Pinecone vector database
- ✅ Includes rate limiting to respect API quotas
- ✅ Handles errors gracefully
- ✅ Automatically uses these resumes as reference context for AI reviews

## Verify
After seeding, run:
```bash
curl -X POST http://localhost:3000/api/proxy -H "Content-Type: application/json" -d '{"action":"pinecone.describeIndexStats"}'
```

Your AI review in `ats-scorer.ts` will now automatically pull similar high-quality resumes as reference context when analyzing user resumes, providing much more accurate feedback.
