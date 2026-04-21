// FINAL WORKING OPENROUTER SEEDER WITH DEBUG
import dotenv from 'dotenv';
import { Pinecone } from '@pinecone-database/pinecone';
import * as fs from 'fs';
import * as path from 'path';

// Load .env
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

if (!process.env.OPENROUTER_API_KEY) {
  console.error('❌ OPENROUTER_API_KEY not found');
  process.exit(1);
}

if (!process.env.PINECONE_API_KEY) {
  console.error('❌ PINECONE_API_KEY not found');
  process.exit(1);
}

if (!process.env.PINECONE_INDEX) {
  console.error('❌ PINECONE_INDEX not found');
  process.exit(1);
}

const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
const index = pinecone.index(process.env.PINECONE_INDEX);

// Generate embeddings using FREE OpenRouter model
async function generateEmbeddings(text: string): Promise<number[]> {
  try {
    const response = await fetch('https://openrouter.ai/api/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'nvidia/llama-nemotron-embed-vl-1b-v2:free',
        input: text.slice(0, 8000)
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`API ${response.status}: ${error.error?.message}`);
    }

    const data = await response.json();

    if (!data.data || !data.data[0] || !data.data[0].embedding) {
      throw new Error('Invalid embedding response');
    }

    return data.data[0].embedding;
  } catch (err) {
    console.error('Embedding error:', err);
    throw err;
  }
}

// Quality filter
function isHighQualityResume(text: string): boolean {
  const checks = [
    text.length > 800,
    /experience|work|employment/i.test(text),
    /education/i.test(text),
    /skills?|technologies/i.test(text)
  ];

  return checks.filter(Boolean).length >= 3;
}

async function seedResumes() {
  console.log('🔍 Loading dataset...');
  const dataset = JSON.parse(fs.readFileSync('./scripts/resume-dataset.json', 'utf8'));
  const filtered = dataset.filter((r: any) => isHighQualityResume(r.text));

  console.log(`✅ ${filtered.length} resumes ready to seed\n`);

  let success = 0;
  let failed = 0;

  for (let i = 0; i < filtered.length; i++) {
    try {
      console.log(`📄 ${i + 1}/${filtered.length}`);

      const embedding = await generateEmbeddings(filtered[i].text);

      // Validate embedding before upsert
      if (!embedding || !Array.isArray(embedding) || embedding.length === 0) {
        throw new Error('Empty embedding generated');
      }

      console.log(`   ✅ Embedding generated (${embedding.length} dimensions)`);

      const vector = {
        id: `seed-${Date.now()}-${i}`,
        values: embedding,
        metadata: {
          content: filtered[i].text.substring(0, 10000), // Pinecone metadata limit
          role: filtered[i].role || 'general',
          source: 'seed_dataset'
        }
      };

      console.log(`   📤 Uploading to Pinecone...`);
      
      // FIX: Proper upsert format for SDK v7.x (requires 'records' key)
      const result = await index.namespace('resumes').upsert({
        records: [vector]
      });
      
      success++;
      console.log(`   ✅ Uploaded! Total success: ${success}`);

    } catch (err: any) {
      failed++;
      console.log(`   ❌ Failed: ${err.message}`);
    }

    await new Promise(r => setTimeout(r, 300));
  }

  console.log(`\n🎉 SEEDING COMPLETE!`);
  console.log(`✅ Success: ${success}`);
  console.log(`❌ Failed: ${failed}`);
}

seedResumes().catch(console.error);
