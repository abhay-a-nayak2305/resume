import { createReadStream, writeFileSync } from 'fs';
import csvParser from 'csv-parser';

/**
 * Convert CSV resume dataset to JSON array format required by seeder
 * 
 * Usage: tsx scripts/convert-csv.ts input.csv output.json
 * 
 * Most Kaggle resume datasets have columns: Resume_str, Category
 */

const inputFile = process.argv[2];
const outputFile = process.argv[3] || './scripts/resume-dataset.json';

if (!inputFile) {
  console.log('❌ Please provide input CSV file path');
  console.log('💡 Usage: tsx scripts/convert-csv.ts path/to/resumes.csv');
  process.exit(1);
}

const resumes: any[] = [];

console.log(`🔄 Converting ${inputFile} to JSON...`);

createReadStream(inputFile)
  .pipe(csvParser())
  .on('data', (row) => {
    // Handle common Kaggle resume dataset columns
    const text = row.Resume_str || row.resume_text || row.text || row.content;
    const role = row.Category || row.category || row.role || row.job_title;
    
    if (text && text.length > 200) {
      resumes.push({
        text: text.trim(),
        role: role?.trim() || 'general',
        yearsExperience: 0,
        qualityScore: 75
      });
    }
  })
  .on('end', () => {
    writeFileSync(outputFile, JSON.stringify(resumes, null, 2));
    console.log(`✅ Conversion complete!`);
    console.log(`📍 Output: ${outputFile}`);
    console.log(`📊 Total resumes converted: ${resumes.length}`);
    console.log(`\n🚀 Now run: tsx scripts/seed-resumes.ts`);
  })
  .on('error', (error) => {
    console.error('❌ Conversion failed:', error);
    process.exit(1);
  });
