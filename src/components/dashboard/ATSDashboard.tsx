import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { Download, Sparkles, FileText, FileDown, CheckCircle, AlertCircle, Lightbulb, TrendingUp, Target, Zap } from 'lucide-react';
import { useState } from 'react';
import html2pdf from 'html2pdf.js';

interface AtsScore {
  overall: number;
  breakdown: {
    formatting: number;
    keywords: number;
    structure: number;
    content: number;
    readability: number;
  };
  details: any[];
}

interface ResumeReview {
  atsScore: AtsScore;
  text: string;
  strengths: string[];
  improvements: any[];
  redFlags: any[];
}

interface AtsDashboardProps {
  review: ResumeReview;
  improvedResume?: string | null;
  onImprove?: () => void;
  isImproving?: boolean;
}

export default function AtsDashboard({ review, improvedResume, onImprove, isImproving }: AtsDashboardProps) {
  const [downloadFormat, setDownloadFormat] = useState<'pdf' | 'txt' | 'docx'>('pdf');
  const [showDownloadOptions, setShowDownloadOptions] = useState(false);

  const score = review.atsScore?.overall || 0;
  
  const pieData = Object.entries(review.atsScore?.breakdown || {}).map(([key, value]) => ({
    name: key.charAt(0).toUpperCase() + key.slice(1),
    value: value,
    color: value >= 80 ? '#10b981' : value >= 60 ? '#f59e0b' : '#ef4444'
  }));

  const radarData = Object.entries(review.atsScore?.breakdown || {}).map(([key, value]) => ({
    category: key.charAt(0).toUpperCase() + key.slice(1),
    score: value,
    fullMark: 100
  }));

  const scoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-500';
    if (score >= 60) return 'text-amber-500';
    return 'text-rose-500';
  };

  const scoreBg = (score: number) => {
    if (score >= 80) return 'from-emerald-500 to-teal-500';
    if (score >= 60) return 'from-amber-500 to-orange-500';
    return 'from-rose-500 to-red-500';
  };

  const handleDownload = () => {
    const content = improvedResume || review.text;
    
    if (downloadFormat === 'txt') {
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'improved-resume.txt';
      a.click();
      URL.revokeObjectURL(url);
    } else if (downloadFormat === 'pdf') {
      const element = document.createElement('div');
      element.innerHTML = `<pre style="white-space: pre-wrap; font-family: Arial; padding: 40px; line-height: 1.6;">${content}</pre>`;
      html2pdf().from(element).save('improved-resume.pdf');
    } else if (downloadFormat === 'docx') {
      const blob = new Blob(['\ufeff', content], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'improved-resume.docx';
      a.click();
      URL.revokeObjectURL(url);
    }
    
    setShowDownloadOptions(false);
  };

  return (
    <div className="space-y-8">
      {/* Hero Score Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-zinc-900 to-zinc-800 p-8 md:p-12">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-amber-500/10 to-rose-500/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-teal-500/10 to-emerald-500/10 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2" />
        
        <div className="relative z-10 flex flex-col lg:flex-row items-center lg:items-start justify-between gap-8">
          <div className="flex-1 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-4">
              <Zap className="w-4 h-4 text-amber-400" />
              <span className="text-xs uppercase tracking-widest text-white/60">ATS Analysis Complete</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-3">Resume ATS Score</h2>
            <p className="text-lg text-white/60 max-w-xl">
              Comprehensive analysis against 1000+ successful resumes and industry ATS standards
            </p>
          </div>

          <div className="relative">
            <div className={`w-40 h-40 rounded-full bg-gradient-to-br ${scoreBg(score)} p-1 shadow-2xl`}>
              <div className="w-full h-full rounded-full bg-zinc-900 flex flex-col items-center justify-center">
                <span className={`text-5xl font-bold ${scoreColor(score)}`}>{score}</span>
                <span className="text-xs uppercase tracking-widest text-white/40">/100</span>
              </div>
            </div>
            <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2">
              <div className={`px-4 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
                score >= 80 ? 'bg-emerald-500 text-white' : score >= 60 ? 'bg-amber-500 text-black' : 'bg-rose-500 text-white'
              }`}>
                {score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : 'Needs Work'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div className="card rounded-3xl p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-rose-500" />
            Score Breakdown
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    background: 'rgba(0,0,0,0.8)', 
                    border: 'none', 
                    borderRadius: '12px',
                    color: 'white'
                  }} 
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Radar Chart */}
        <div className="card rounded-3xl p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-teal-500" />
            Performance Radar
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="currentColor" strokeOpacity={0.1} />
                <PolarAngleAxis dataKey="category" tick={{ fontSize: 11 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
                <Radar
                  name="Score"
                  dataKey="score"
                  stroke="#f43f5e"
                  fill="#f43f5e"
                  fillOpacity={0.3}
                />
                <Tooltip 
                  contentStyle={{ 
                    background: 'rgba(0,0,0,0.8)', 
                    border: 'none', 
                    borderRadius: '12px',
                    color: 'white'
                  }} 
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="card rounded-3xl p-6">
        <h3 className="text-lg font-semibold mb-6">Detailed Category Scores</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={pieData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
              <Tooltip 
                contentStyle={{ 
                  background: 'rgba(0,0,0,0.8)', 
                  border: 'none', 
                  borderRadius: '12px',
                  color: 'white'
                }} 
              />
              <Bar dataKey="value" radius={[8, 8, 0, 0]} barSize={40}>
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Pros & Cons Section */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Strengths */}
        <div className="card rounded-3xl p-6 border-2 border-emerald-500/20 bg-emerald-500/5">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-emerald-500" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Strengths</h3>
              <p className="text-sm opacity-50">What your resume does well</p>
            </div>
          </div>
          <div className="space-y-3">
            {review.strengths?.map((strength, i) => (
              <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm">{strength}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Areas for Improvement */}
        <div className="card rounded-3xl p-6 border-2 border-amber-500/20 bg-amber-500/5">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 flex items-center justify-center">
              <Lightbulb className="w-6 h-6 text-amber-500" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Areas to Improve</h3>
              <p className="text-sm opacity-50">Key opportunities for enhancement</p>
            </div>
          </div>
          <div className="space-y-3">
            {review.improvements?.slice(0, 4).map((imp, i) => (
              <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/5 border border-amber-500/10">
                <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">{imp.issue}</p>
                  <p className="text-xs opacity-60 mt-1">{imp.suggestion}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Action Section */}
      <div className="card rounded-3xl p-8 bg-gradient-to-br from-rose-500/10 to-amber-500/10 border border-rose-500/20">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-500 to-amber-500 flex items-center justify-center shadow-lg shadow-rose-500/30">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold">One-Click Resume Improvement</h3>
              <p className="text-sm opacity-60 max-w-md">
                AI will rewrite your resume incorporating all feedback, making it ATS-optimized and achievement-focused
              </p>
            </div>
          </div>
          
          <button
            onClick={onImprove}
            disabled={isImproving}
            className="btn btn-primary rounded-2xl px-8 py-5 min-w-[180px] flex items-center justify-center gap-3"
          >
            {isImproving ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span className="font-semibold uppercase tracking-widest text-xs">Optimizing...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span className="font-semibold uppercase tracking-widest text-xs">Improve Resume</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Improved Resume Section */}
      {improvedResume && (
        <div className="card rounded-3xl p-6 border-2 border-emerald-500/20">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center">
                <FileText className="w-6 h-6 text-emerald-500" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Improved Resume Generated!</h3>
                <p className="text-sm opacity-50">Your optimized resume is ready for download</p>
              </div>
            </div>
            
            <div className="relative">
              <button
                onClick={() => setShowDownloadOptions(!showDownloadOptions)}
                className="btn btn-outline rounded-xl px-6 py-3 flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span className="font-semibold uppercase tracking-widest text-xs">Download</span>
              </button>
              
              {showDownloadOptions && (
                <div className="absolute right-0 top-full mt-2 bg-white dark:bg-zinc-900 rounded-xl shadow-xl border border-black/10 dark:border-white/10 p-2 z-50 min-w-[160px]">
                  {(['pdf', 'txt', 'docx'] as const).map((format) => (
                    <button
                      key={format}
                      onClick={() => {
                        setDownloadFormat(format);
                        handleDownload();
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-left"
                    >
                      <FileDown className="w-4 h-4" />
                      <span className="text-sm font-medium capitalize">{format.toUpperCase()}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 max-h-[500px] overflow-y-auto">
            <pre className="whitespace-pre-wrap text-sm font-sans leading-relaxed">{improvedResume}</pre>
          </div>
        </div>
      )}
    </div>
  );
}
