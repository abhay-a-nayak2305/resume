import { AlertCircle, CheckCircle, Lightbulb, Monitor, Sparkles, Loader2, GitCompare, User, ChevronDown, ChevronUp } from 'lucide-react';
import { useState, useEffect } from 'react';
import ATSEmulator from '../ats-emulator/ATSEmulator';
import VersionComparison from '../ui/VersionComparison';
import RecruiterPersonaSimulation from '../ui/RecruiterPersonaSimulation';
import AtsDashboard from '../dashboard/ATSDashboard';
import { createChatCompletion } from '../../lib/pinecone';

interface ResumeReviewProps {
  review: any;
}

export default function ResumeReview({ review }: ResumeReviewProps) {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'overview' | 'ats' | 'compare' | 'recruiter'>('dashboard');
  const [isImproving, setIsImproving] = useState(false);
  const [improvedResume, setImprovedResume] = useState<string | null>(null);
  const [compareResume, setCompareResume] = useState<any>(null);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({ strengths: true, improvements: false, redFlags: false });
  const [isVisible, setIsVisible] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    setIsVisible(true);
    
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-amber-500';
    return 'text-red-500';
  };

  const barColor = (score: number) => {
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#f59e0b';
    return '#ef4444';
  };

  const chartData = Object.entries(review.atsScore?.breakdown || {}).map(([key, value]) => ({
    name: key.charAt(0).toUpperCase() + key.slice(1),
    score: value as number
  }));

  const handleOneClickImprove = async () => {
    setIsImproving(true);
    setImprovedResume(null);
    
    try {
      const response = await createChatCompletion([
        {
          role: 'system',
          content: 'You are an expert resume writer. Rewrite this entire resume incorporating all the feedback and improvements. Make it ATS optimized, achievement focused, and quantified. Return ONLY the improved resume text with no extra commentary.'
        },
        {
          role: 'user',
          content: `Original resume: ${review.text}\n\nFeedback: ${JSON.stringify(review.improvements)}`
        }
      ], {
        temperature: 0.7
      });

      setImprovedResume(response.choices[0].message.content);
    } finally {
      setIsImproving(false);
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: Sparkles },
    { id: 'overview', label: 'Detailed Review', icon: Lightbulb },
    { id: 'ats', label: 'ATS Emulator', icon: Monitor },
    { id: 'recruiter', label: 'Recruiter View', icon: User },
    { id: 'compare', label: 'Compare', icon: GitCompare },
  ];

  const score = review.atsScore?.overall || 0;
  const circumference = 2 * Math.PI * 88;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="space-y-8 animate-reveal">
      {/* Score Header */}
      <div 
        className="card rounded-3xl p-8 sm:p-12 overflow-hidden relative"
        style={{ 
          transform: `translateY(${scrollY * 0.02}px)`,
          opacity: isVisible ? 1 : 0 
        }}
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-red-500/10 to-amber-500/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
        
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 mb-10 relative z-10">
          <div className="flex-1">
            <p className="text-xs uppercase tracking-widest opacity-50 mb-2 text-reveal">Analysis Complete</p>
            <h2 className="text-4xl sm:text-5xl font-bold mb-3 text-reveal text-reveal-stagger-1">Your Resume Score</h2>
            <p className="text-lg opacity-60 max-w-xl text-reveal text-reveal-stagger-2">Based on analysis of 1000+ successful resumes and industry best practices</p>
          </div>
          
           <div className="flex items-center gap-8">
              {/* Circular Gauge Score */}
              <div className="relative animate-reveal animate-stagger-2">
               <svg className="w-48 h-48 transform -rotate-90" viewBox="0 0 200 200">
                  <circle
                    cx="100"
                    cy="100"
                    r="88"
                    fill="none"
                    stroke="currentColor"
                    strokeOpacity="0.1"
                    strokeWidth="12"
                  />
                  <circle
                    cx="100"
                    cy="100"
                    r="88"
                    fill="none"
                    stroke={`url(#gradient-${score})`}
                    strokeWidth="12"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    className="transition-all duration-1500 ease-out"
                  />
                  <defs>
                    <linearGradient id={`gradient-${score}`} x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor={score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444'} />
                      <stop offset="100%" stopColor={score >= 80 ? '#34d399' : score >= 60 ? '#fbbf24' : '#f87171'} />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className={`text-5xl font-bold ${scoreColor(score)}`}>{score}</span>
                  <span className="text-xs uppercase tracking-widest opacity-50">/100</span>
                </div>
              </div>
            </div>
         </div>

        {/* Review Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => { console.log("Switching to tab:", tab.id); setActiveTab(tab.id as any); }}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium text-sm transition-all duration-300 ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-red-500 to-amber-500 text-white shadow-lg shadow-red-500/20'
                  : 'hover:bg-black/5 dark:hover:bg-white/5 opacity-70 hover:opacity-100'
              }`}
            >
              <tab.icon className="w-4 h-4" strokeWidth={1.5} />
              <span className="uppercase tracking-widest text-xs font-semibold">{tab.label}</span>
            </button>
          ))}
        </div>

        {activeTab === 'dashboard' && (
          <div className="animate-reveal">
            <AtsDashboard 
              review={review} 
              improvedResume={improvedResume}
              onImprove={handleOneClickImprove}
              isImproving={isImproving}
            />
          </div>
        )}

        {activeTab === 'overview' && (
          <div className="animate-reveal">
            {/* Strengths Section */}
            {review.strengths?.length > 0 && (
              <div className="mb-6 animate-reveal animate-stagger-1">
                <button 
                  onClick={() => toggleSection('strengths')}
                  className="w-full flex items-center justify-between p-4 hover:bg-black/5 dark:hover:bg-white/5 rounded-xl transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-500/10 rounded-xl flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-green-500" strokeWidth={1.5} />
                    </div>
                    <div className="text-left">
                      <h3 className="font-semibold">Strengths</h3>
                      <p className="text-sm opacity-50">{review.strengths.length} strong points</p>
                    </div>
                  </div>
                  {expandedSections.strengths ? <ChevronUp className="w-5 h-5 opacity-50" /> : <ChevronDown className="w-5 h-5 opacity-50" />}
                </button>
                
                {expandedSections.strengths && (
                  <div className="grid gap-3 mt-3 ml-13 animate-slide-up">
                    {review.strengths.map((strength: string, i: number) => (
                      <div 
                        key={i} 
                        className="flex items-start gap-3 p-4 bg-green-500/5 rounded-xl border border-green-500/10"
                        style={{ animationDelay: `${i * 0.1}s` }}
                      >
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" strokeWidth={2} />
                        <p className="text-sm">{strength}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Improvements Section */}
            {review.improvements?.length > 0 && (
              <div className="mb-6 animate-reveal animate-stagger-2">
                <button 
                  onClick={() => toggleSection('improvements')}
                  className="w-full flex items-center justify-between p-4 hover:bg-black/5 dark:hover:bg-white/5 rounded-xl transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center">
                      <Lightbulb className="w-5 h-5 text-amber-500" strokeWidth={1.5} />
                    </div>
                    <div className="text-left">
                      <h3 className="font-semibold">Areas for Improvement</h3>
                      <p className="text-sm opacity-50">{review.improvements.length} suggestions</p>
                    </div>
                  </div>
                  {expandedSections.improvements ? <ChevronUp className="w-5 h-5 opacity-50" /> : <ChevronDown className="w-5 h-5 opacity-50" />}
                </button>
                
                {expandedSections.improvements && (
                  <div className="grid gap-3 mt-3 ml-13 animate-slide-up">
                    {review.improvements.map((imp: any, i: number) => (
                      <div 
                        key={i} 
                        className="flex items-start gap-3 p-4 bg-amber-500/5 rounded-xl border border-amber-500/10"
                        style={{ animationDelay: `${i * 0.1}s` }}
                      >
                        <Lightbulb className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" strokeWidth={2} />
                        <div>
                          <p className="font-medium text-sm">{imp.issue}</p>
                          <p className="text-sm opacity-60 mt-1">{imp.suggestion}</p>
                          {imp.example && (
                            <p className="text-xs opacity-40 mt-2 font-mono bg-white dark:bg-zinc-900 p-2 rounded">{imp.example}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Red Flags Section */}
            {review.redFlags?.length > 0 && (
              <div className="animate-reveal animate-stagger-3">
                <button 
                  onClick={() => toggleSection('redFlags')}
                  className="w-full flex items-center justify-between p-4 hover:bg-black/5 dark:hover:bg-white/5 rounded-xl transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center">
                      <AlertCircle className="w-5 h-5 text-red-500" strokeWidth={1.5} />
                    </div>
                    <div className="text-left">
                      <h3 className="font-semibold">Red Flags</h3>
                      <p className="text-sm opacity-50">{review.redFlags.length} critical items</p>
                    </div>
                  </div>
                  {expandedSections.redFlags ? <ChevronUp className="w-5 h-5 opacity-50" /> : <ChevronDown className="w-5 h-5 opacity-50" />}
                </button>
                
                {expandedSections.redFlags && (
                  <div className="grid gap-3 mt-3 ml-13 animate-slide-up">
                    {review.redFlags.map((flag: any, i: number) => (
                      <div 
                        key={i} 
                        className="flex items-start gap-3 p-4 bg-red-500/5 rounded-xl border border-red-500/10"
                        style={{ animationDelay: `${i * 0.1}s` }}
                      >
                        <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" strokeWidth={2} />
                        <div>
                          <p className="font-medium text-sm">{flag.issue}</p>
                          <p className="text-sm opacity-60 mt-1">{flag.impact}</p>
                          <p className="text-xs opacity-40 mt-2">{flag.recruiterStatistic}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'ats' && (
          <div className="animate-reveal">
            <ATSEmulator resumeText={review.text} />
          </div>
        )}

        {activeTab === 'recruiter' && (
          <div className="animate-reveal">
            <RecruiterPersonaSimulation resumeText={review.text} />
          </div>
        )}

        {activeTab === 'compare' && (
          <div className="animate-reveal">
            <VersionComparison resume1={review} resume2={compareResume || review} />
          </div>
        )}
      </div>
    </div>
  );
}


