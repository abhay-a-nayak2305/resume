import { generateEmbeddings } from '../src/lib/pinecone';
import * as fs from 'fs';

// Quality filter for resumes
function isHighQualityResume(text: string): boolean {
  const checks = [
    text.length > 800,
    /experience|work|employment/i.test(text),
    /education/i.test(text),
    /skills?|technologies/i.test(text),
    /\d+%|\$\d+|\d+\+|increased|reduced|improved/.test(text), // Quantified achievements
    !text.toLowerCase().includes('confidential'),
    !text.toLowerCase().includes('redacted'),
    !text.toLowerCase().includes('example resume')
  ];
  
  return checks.filter(Boolean).length >= 5;
}

async function seedResumes() {
  console.log('🔍 Loading resume dataset...');
  
  try {
    // Load dataset
    const datasetPath = './scripts/resume-dataset.json';
    if (!fs.existsSync(datasetPath)) {
      console.log('⚠️  resume-dataset.json not found in scripts folder');
      console.log('💡 Download a dataset and place it at ./scripts/resume-dataset.json');
      console.log('💡 Dataset should be an array of objects with { text: string, role?: string, yearsExperience?: number }');
      process.exit(1);
    }
    
    const resumes = JSON.parse(fs.readFileSync(datasetPath, 'utf8'));
    console.log(`✅ Loaded ${resumes.length} resumes from dataset`);
    
    // Filter high quality only
    const filteredResumes = resumes.filter((r: any) => isHighQualityResume(r.text));
    console.log(`🎯 Filtered to ${filteredResumes.length} high quality resumes`);
    
    console.log(`\n🚀 Starting seeding process...`);
    
    // Process in batches
    const BATCH_SIZE = 50;
    const DELAY_MS = 500;
    let processed = 0;
    let failed = 0;
    
    for (let i = 0; i < filteredResumes.length; i += BATCH_SIZE) {
      const batch = filteredResumes.slice(i, i + BATCH_SIZE);
      
      console.log(`\n📦 Processing batch ${Math.floor(i/BATCH_SIZE) + 1}/${Math.ceil(filteredResumes.length/BATCH_SIZE)}`);
      console.log(`📍 Progress: ${processed}/${filteredResumes.length}`);
      
      try {
        // Generate embeddings in parallel
        const vectors = await Promise.all(
          batch.map(async (resume: any, idx: number) => {
            const embedding = await generateEmbeddings(resume.text);
            return {
              id: `seed-resume-${i + idx}`,
              values: embedding,
              metadata: {
                content: resume.text,
                role: resume.role || 'general',
                yearsExperience: resume.yearsExperience || 0,
                source: 'seed_dataset',
                qualityScore: resume.qualityScore || 80,
                seedDate: new Date().toISOString()
              }
            };
          })
        );
        
        // Upsert to Pinecone
        const response = await fetch('http://localhost:3000/api/proxy', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'pinecone.upsert',
            vectors,
            namespace: 'resumes'
          })
        });
        
        if (!response.ok) {
          console.error(`❌ Batch failed: ${await response.text()}`);
          failed += batch.length;
        } else {
          processed += batch.length;
          console.log(`✅ Batch successful`);
        }
        
      } catch (error) {
        console.error(`❌ Batch error:`, error);
        failed += batch.length;
      }
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, DELAY_MS));
    }
    
    console.log(`\n🎉 Seeding complete!`);
    console.log(`✅ Success: ${processed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`\n🔍 Verify with: curl -X POST http://localhost:3000/api/proxy -H "Content-Type: application/json" -d '{"action":"pinecone.describeIndexStats"}'`);
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seedResumes().catch(console.error);
