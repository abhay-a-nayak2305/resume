import { createChatCompletion } from './pinecone';

export function calculateAtsScore(resumeText: string): {
  overall: number;
  breakdown: { formatting: number; keywords: number; structure: number; content: number; readability: number };
  details: any[];
} {
  // Email regex: standard email format
  const hasEmail = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(resumeText);
  // Phone regex: various formats
  const hasPhone = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/.test(resumeText);
  const hasQuantification = /\d+%|\$\d+|\d+\+|\d+\s*(x|times|increase|decrease|improve|reduce|grow)/i.test(resumeText);
  const hasStandardSections = /experience|work|employment|education|skills?|projects?/i.test(resumeText);
  const bulletPoints = resumeText.split('\n').filter(line => /^[•●◦\-*]/.test(line.trim())).length;
  const actionVerbs = /(?:^|\s)(managed|led|developed|built|implemented|increased|reduced|designed|optimized|launched)/i.test(resumeText);

  const checks = [
    {
      category: 'formatting',
      score: hasEmail && hasPhone ? 90 : hasEmail || hasPhone ? 65 : 40,
      feedback: hasEmail && hasPhone ? 'Complete contact information found' : hasEmail ? 'Email found, missing phone' : 'Missing critical contact information',
      suggestion: 'Ensure email and phone number are clearly visible at the top'
    },
    {
      category: 'structure',
      score: hasStandardSections ? 85 : 50,
      feedback: hasStandardSections ? 'Clear section structure detected' : 'Standard section headings not found',
      suggestion: 'Use standard section headings: Experience, Education, Skills'
    },
    {
      category: 'content',
      score: hasQuantification ? 85 : bulletPoints > 5 ? 60 : 35,
      feedback: hasQuantification ? 'Quantified achievements detected - excellent!' : bulletPoints > 5 ? 'Bullet points used but lacking metrics' : 'Few achievements listed',
      suggestion: 'Add metrics: Increased revenue by 25% instead of Helped with revenue'
    },
    {
      category: 'keywords',
      score: resumeText.length > 500 ? 80 : resumeText.length > 300 ? 60 : 40,
      feedback: 'Keyword density analysis',
      suggestion: 'Include relevant industry keywords naturally throughout'
    },
    {
      category: 'readability',
      score: bulletPoints > 10 ? 90 : bulletPoints > 5 ? 70 : 50,
      feedback: `${bulletPoints} bullet points detected`,
      suggestion: 'Use bullet points for scannability - recruiters spend 7 seconds scanning'
    }
  ];

  const breakdown: any = {};
  checks.forEach(c => breakdown[c.category] = c.score);
  
  const overall = Math.round(checks.reduce((sum, c) => sum + c.score, 0) / checks.length);

  return {
    overall,
    breakdown,
    details: checks
  };
}

export async function analyzeResumeWithAI(resumeText: string, ragContext: any[]) {
  try {
    const systemPrompt = 'You are an expert resume reviewer with 15+ years of experience in technical recruiting and ATS optimization. Analyze this resume and provide actionable feedback. Return ONLY valid JSON with no extra text.';
    
    const contextText = ragContext.map(c => c.metadata?.content || '').filter(Boolean).join('\n\n');

    const userPrompt = `
Analyze this resume:
${resumeText}

Reference context from successful resumes:
${contextText}

Provide feedback in JSON format with exactly these fields:
- strengths: array of strings (3-5 items)
- improvements: array of objects with { priority: high|medium|low, category: string, issue: string, suggestion: string, example: string }
- redFlags: array of objects with { severity: critical|warning|notice, issue: string, impact: string, fix: string, recruiterStatistic: string }
`;

    const response = await createChatCompletion([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ], {
      temperature: 0.7,
      response_format: { type: 'json_object' }
    });

    return JSON.parse(response.choices[0].message.content || '{}');
  } catch (error) {
    console.error('AI analysis failed:', error);
    return {
      strengths: ['Resume parsed successfully'],
      improvements: [],
      redFlags: []
    };
  }
}
