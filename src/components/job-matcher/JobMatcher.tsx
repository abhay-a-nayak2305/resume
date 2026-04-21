import { useState } from 'react';
import { Target, Search, BarChart3, ArrowRight, CheckCircle2, XCircle, AlertCircle, Loader2 } from 'lucide-react';
import { generateEmbeddings, searchKnowledgeBase } from '../../lib/pinecone';
import { createChatCompletion } from '../../lib/pinecone';

export default function JobMatcher() {
  const [jobDescription, setJobDescription] = useState('');
  const [resumeText, setResumeText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<any>(null);

  const analyzeMatch = async () => {
    if (!jobDescription || !resumeText) return;
    
    setIsAnalyzing(true);
    setResults(null);
    try {
      const [resumeEmbedding, jdEmbedding] = await Promise.all([
        generateEmbeddings(resumeText),
        generateEmbeddings(jobDescription)
      ]);

      const [jdKeywords, resumeKeywords] = await Promise.all([
        searchKnowledgeBase(jdEmbedding, 'keywords'),
        searchKnowledgeBase(resumeEmbedding, 'keywords')
      ]);

      const response = await createChatCompletion([
        {
          role: 'system',
          content: 'Compare this resume against the job description. Provide a match analysis with overall score, matching skills, missing skills, and keyword gaps. Return ONLY valid JSON.'
        },
        {
          role: 'user',
          content: `
            RESUME:
            ${resumeText}
            
            JOB DESCRIPTION:
            ${jobDescription}
            
            Return JSON with:
            - overallScore: number (0-100)
            - matchingSkills: string[]
            - missingSkills: string[]
            - keywordGaps: { keyword: string, importance: 'critical'|'important'|'preferred', frequency: number }[]
            - suggestions: string[]
          `
        }
      ], {
        response_format: { type: 'json_object' },
        temperature: 0.3
      });

      setResults(JSON.parse(response.choices[0].message.content || '{}'));
    } finally {
      setIsAnalyzing(false);
    }
  };

  const scoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-amber-500';
    return 'text-red-500';
  };

  return (
    <div className="max-w-6xl mx-auto animate-reveal">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold mb-3">Job Description Matcher</h2>
        <p className="text-lg opacity-60">See how well your resume matches a specific job and identify missing keywords</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-12">
        {/* Resume Input */}
        <div className="card p-6 rounded-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
              <Target className="w-6 h-6 text-blue-500" aria-hidden="true" />
            </div>
            <div>
              <h3 className="font-bold text-xl">Your Resume</h3>
              <p className="text-sm opacity-50">Paste your resume text</p>
            </div>
          </div>
          <textarea
            className="input rounded-xl min-h-[300px] resize-vertical"
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            placeholder="Paste your full resume text here..."
          />
        </div>

        {/* Job Description Input */}
        <div className="card p-6 rounded-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
              <Search className="w-6 h-6 text-purple-500" aria-hidden="true" />
            </div>
            <div>
              <h3 className="font-bold text-xl">Job Description</h3>
              <p className="text-sm opacity-50">Paste the job posting</p>
            </div>
          </div>
          <textarea
            className="input rounded-xl min-h-[300px] resize-vertical"
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste the full job description here..."
          />
        </div>
      </div>

      <div className="flex justify-center mb-12">
        <button
          onClick={analyzeMatch}
          disabled={isAnalyzing || !jobDescription || !resumeText}
          className="btn btn-primary rounded-2xl px-12 py-5 text-lg flex items-center gap-3"
        >
          {isAnalyzing ? (
            <Loader2 className="w-6 h-6 animate-spin" strokeWidth={1.5} />
          ) : (
            <BarChart3 className="w-6 h-6" strokeWidth={1.5} />
          )}
          <span className="font-semibold uppercase tracking-widest">
            {isAnalyzing ? 'Analyzing Match...' : 'Analyze Match'}
          </span>
        </button>
      </div>

      {results && (
        <div className="card rounded-3xl p-8 animate-reveal">
          <div className="text-center mb-10">
            <div className="text-7xl font-bold mb-4">
              <span className={scoreColor(results.overallScore)}>
                {results.overallScore}
              </span>
              <span className="text-4xl opacity-30">/100</span>
            </div>
            <p className="text-xl opacity-60">Match Score</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Matching Skills */}
            <div>
              <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                Matching Skills ({results.matchingSkills?.length || 0})
              </h4>
              <div className="flex flex-wrap gap-2">
                {results.matchingSkills?.map((skill: string, i: number) => (
                  <span key={i} className="badge badge-success">{skill}</span>
                ))}
              </div>
            </div>

            {/* Missing Skills */}
            <div>
              <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
                <XCircle className="w-5 h-5 text-red-500" />
                Missing Skills ({results.missingSkills?.length || 0})
              </h4>
              <div className="flex flex-wrap gap-2">
                {results.missingSkills?.map((skill: string, i: number) => (
                  <span key={i} className="badge badge-danger">{skill}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Suggestions */}
          {results.suggestions?.length > 0 && (
            <div className="mt-8 pt-8 border-t border-current/10">
              <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-amber-500" />
                Suggestions
              </h4>
              <ul className="space-y-3">
                {results.suggestions.map((suggestion: string, i: number) => (
                  <li key={i} className="flex items-start gap-3">
                    <ArrowRight className="w-4 h-4 mt-1 flex-shrink-0 opacity-50" />
                    <p>{suggestion}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
