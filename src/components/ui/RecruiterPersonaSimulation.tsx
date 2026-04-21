import { useState } from 'react';
import { User, Cpu, Briefcase, Sparkles, Clock } from 'lucide-react';
import { createChatCompletion } from '../../lib/pinecone';

interface RecruiterPersonaProps {
  resumeText: string;
}

const personas = [
  {
    id: 'junior',
    name: 'Junior Recruiter',
    icon: Clock,
    description: '3 second scan - what jumps out immediately',
    time: '3 seconds',
    prompt: 'You are an overworked junior recruiter scanning 200 resumes per hour. You spend exactly 3 seconds on each resume. Tell me ONLY what jumps out at you in those 3 seconds. Be brutal and honest. No sugarcoating.'
  },
  {
    id: 'manager',
    name: 'Hiring Manager',
    icon: Briefcase,
    description: 'Detailed technical review',
    time: '3 minutes',
    prompt: 'You are a hiring manager reviewing this resume for a technical role. Analyze it in detail. What would make you want to interview this candidate? What concerns would you have? Be specific and critical.'
  },
  {
    id: 'ats',
    name: 'ATS Only Mode',
    icon: Cpu,
    description: 'Pure algorithmic parsing',
    time: 'Instant',
    prompt: 'You are an ATS parser. Show exactly what keywords and information were detected. List what was missed. Show the extracted structured data exactly as the parser sees it.'
  },
  {
    id: 'executive',
    name: 'Executive Recruiter',
    icon: User,
    description: 'Senior level assessment',
    time: '5 minutes',
    prompt: 'You are an executive recruiter for senior roles. What does this resume communicate about leadership, impact, and career progression? What story does it tell? What are the red flags?'
  }
];

export default function RecruiterPersonaSimulation({ resumeText }: RecruiterPersonaProps) {
  const [activePersona, setActivePersona] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const runSimulation = async (persona: typeof personas[0]) => {
    setActivePersona(persona.id);
    setIsLoading(true);
    setResult(null);

    try {
      const response = await createChatCompletion([
        { role: 'system', content: persona.prompt },
        { role: 'user', content: `Resume: ${resumeText}` }
      ], {
        temperature: 0.8
      });

      setResult(response.choices[0].message.content);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="card p-5 sm:p-6 animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
        <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">Recruiter Persona Simulation</h3>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {personas.map((persona) => (
          <button
            key={persona.id}
            onClick={() => runSimulation(persona)}
            disabled={isLoading}
            className={`flex flex-col items-center gap-2 p-4 rounded-xl transition-all ${
              activePersona === persona.id
                ? 'bg-purple-100 dark:bg-purple-900/30 border-2 border-purple-500'
                : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
            }`}
          >
            <persona.icon className="w-8 h-8 opacity-60" />
            <span className="font-medium text-sm">{persona.name}</span>
            <span className="text-xs opacity-50">{persona.time}</span>
          </button>
        ))}
      </div>

      {isLoading && (
        <div className="text-center py-12">
          <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-500">Running simulation...</p>
        </div>
      )}

      {result && (
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 mt-4">
          <pre className="whitespace-pre-wrap text-sm leading-relaxed">{result}</pre>
        </div>
      )}
    </div>
  );
}
