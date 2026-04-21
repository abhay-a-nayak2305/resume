import { Pinecone } from '@pinecone-database/pinecone';
import OpenAI from 'openai';
import * as fs from 'fs';
import * as path from 'path';
import mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist';
import dotenv from 'dotenv';

// Configure environment
dotenv.config({ path: path.join(__dirname, '..', '..', '..', '.env') });

interface ResumeMetadata {
  role: string;
  seniority: 'entry' | 'junior' | 'mid' | 'senior' | 'staff' | 'principal' | 'executive';
  industry: string;
  yearsExperience: number;
  atsScore?: number;
  source: string;
  keywords?: string[];
}

interface ProcessedResume {
  id: string;
  text: string;
  metadata: ResumeMetadata;
}

class ResumeSeeder {
  private pinecone: Pinecone;
  private openai: OpenAI;
  private batchSize = 10;
  private rateLimitDelay = 200;

  constructor() {
    this.pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY as string
    });
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY as string
    });
  }

  /**
   * Extract text from PDF files
   */
  async extractTextFromPDF(filePath: string): Promise<string> {
    const data = new Uint8Array(fs.readFileSync(filePath));
    const pdf = await pdfjsLib.getDocument({ data }).promise;
    let fullText = '';
    
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      fullText += pageText + '\n\n';
    }
    
    return this.cleanText(fullText);
  }

  /**
   * Extract text from DOCX files
   */
  async extractTextFromDocx(filePath: string): Promise<string> {
    const result = await mammoth.extractRawText({ path: filePath });
    return this.cleanText(result.value);
  }

  /**
   * Extract text from TXT files
   */
  extractTextFromTxt(filePath: string): string {
    return this.cleanText(fs.readFileSync(filePath, 'utf-8'));
  }

  /**
   * Clean and normalize resume text
   */
  private cleanText(text: string): string {
    return text
      .replace(/\s+/g, ' ')
      .replace(/[^\x20-\x7E\n]/g, '')
      .replace(/\n\s*\n/g, '\n')
      .trim();
  }

  /**
   * Auto-generate metadata using AI for unlabeled resumes
   */
  async generateMetadata(resumeText: string): Promise<ResumeMetadata> {
    const response = await this.openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      temperature: 0,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: 'Analyze this resume and return JSON with: role (job title), seniority (entry/junior/mid/senior/staff/principal/executive), industry, yearsExperience (number), keywords (array of 5-10 key skills).'
        },
        {
          role: 'user',
          content: resumeText.slice(0, 8000)
        }
      ]
    });

    return JSON.parse(response.choices[0].message.content || '{}');
  }

  /**
   * Process a single resume file
   */
  async processResumeFile(filePath: string, manualMetadata?: Partial<ResumeMetadata>): Promise<ProcessedResume> {
    const ext = path.extname(filePath).toLowerCase();
    let text: string;

    switch (ext) {
      case '.pdf':
        text = await this.extractTextFromPDF(filePath);
        break;
      case '.docx':
      case '.doc':
        text = await this.extractTextFromDocx(filePath);
        break;
      case '.txt':
        text = this.extractTextFromTxt(filePath);
        break;
      default:
        throw new Error(`Unsupported file type: ${ext}`);
    }

    // Generate metadata or use provided
    const autoMetadata = await this.generateMetadata(text);
    const metadata = { ...autoMetadata, ...manualMetadata, source: 'curated_resumes' };

    return {
      id: `resume-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      text,
      metadata
    };
  }

  /**
   * Process all resumes in a directory
   */
  async processDirectory(directoryPath: string): Promise<ProcessedResume[]> {
    const files = fs.readdirSync(directoryPath)
      .filter(file => ['.pdf', '.docx', '.doc', '.txt'].includes(path.extname(file).toLowerCase()));

    console.log(`Found ${files.length} resume files to process`);

    const resumes: ProcessedResume[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      console.log(`Processing (${i+1}/${files.length}): ${file}`);
      
      try {
        const resume = await this.processResumeFile(path.join(directoryPath, file));
        resumes.push(resume);
        await new Promise(r => setTimeout(r, this.rateLimitDelay));
      } catch (error) {
        console.error(`Failed to process ${file}:`, error);
      }
    }

    return resumes;
  }

  /**
   * Upsert resumes to Pinecone in batches
   */
  async upsertToPinecone(resumes: ProcessedResume[]) {
    const index = this.pinecone.index(process.env.PINECONE_INDEX_NAME as string);
    
    console.log(`Upserting ${resumes.length} resumes to Pinecone...`);

    for (let i = 0; i < resumes.length; i += this.batchSize) {
      const batch = resumes.slice(i, i + this.batchSize);
      
      // Generate embeddings for batch
      const embeddings = await this.openai.embeddings.create({
        model: 'text-embedding-ada-002',
        input: batch.map(r => r.text)
      });

      const vectors = batch.map((resume, idx) => ({
        id: resume.id,
        values: embeddings.data[idx].embedding,
        metadata: {
          ...resume.metadata,
          content: resume.text
        }
      }));

      await index.upsert({ records: vectors });
      console.log(`Upserted batch ${Math.floor(i/this.batchSize) + 1}/${Math.ceil(resumes.length/this.batchSize)}`);
      
      await new Promise(r => setTimeout(r, this.rateLimitDelay * 2));
    }

    const stats = await index.describeIndexStats();
    console.log(`✓ Complete. Total vectors in index: ${stats.totalRecordCount}`);
  }

  /**
   * Full seeding workflow
   */
  async seedFromDirectory(resumeDirectory: string) {
    console.log('🚀 Starting real resume seeding process...\n');
    
    const resumes = await this.processDirectory(resumeDirectory);
    
    if (resumes.length === 0) {
      console.log('No resumes were processed successfully');
      return;
    }

    console.log(`\nSuccessfully processed ${resumes.length} resumes:`);
    resumes.forEach(r => {
      console.log(`  • ${r.metadata.role} - ${r.metadata.seniority} - ${r.metadata.industry}`);
    });

    console.log('\n');
    await this.upsertToPinecone(resumes);
    
    console.log('\n✅ Seeding completed successfully!');
  }
}

// Run seeding
const RESUME_DIRECTORY = path.join(__dirname, '..', '..', '..', 'resumes');

// Create resumes directory if it doesn't exist
if (!fs.existsSync(RESUME_DIRECTORY)) {
  fs.mkdirSync(RESUME_DIRECTORY, { recursive: true });
  console.log(`Created resume directory at: ${RESUME_DIRECTORY}`);
  console.log('Place your actual resume files (PDF/DOCX/TXT) in this directory and run again.');
  process.exit(0);
}

// Run the seeder
const seeder = new ResumeSeeder();
seeder.seedFromDirectory(RESUME_DIRECTORY)
  .catch(console.error);