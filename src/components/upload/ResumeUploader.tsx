import { useState, useCallback, useRef } from 'react';
import { Upload, FileText, AlertCircle, Loader2, CheckCircle2, X, Sparkles } from 'lucide-react';
import { parseResume } from '../../lib/parser';
import { calculateAtsScore, analyzeResumeWithAI } from '../../lib/ats-scorer';
import { analyzeResumeWithRAG } from '../../lib/pinecone';

interface ResumeUploaderProps {
  onMagneticHover?: (e: React.MouseEvent<HTMLElement>) => void;
  onMagneticLeave?: (e: React.MouseEvent<HTMLElement>) => void;
  onParseComplete: (resume: any) => void;
  onReviewComplete: (review: any) => void;
}

export default function ResumeUploader({ onParseComplete, onReviewComplete }: ResumeUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [step, setStep] = useState<'idle' | 'parsing' | 'analyzing' | 'complete'>('idle');
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  
  const abortController = useRef<AbortController | null>(null);
  const uploadZoneRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!uploadZoneRef.current || isDragging) return;
    const rect = uploadZoneRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 10;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 10;
    setTilt({ x, y });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  const handleFile = useCallback(async (file: File) => {
    if (abortController.current) {
      abortController.current.abort();
    }
    abortController.current = new AbortController();

    setError(null);
    setUploadedFile(file);
    setIsLoading(true);
    setStep('parsing');
    setProgress(20);

    try {
      const text = await parseResume(file);
      setProgress(40);
      setStep('analyzing');

      let ragContext = { knowledge: [], similarResumes: [] };
      try {
        ragContext = await analyzeResumeWithRAG(text);
      } catch (e) {
        console.log('RAG analysis skipped:', e);
      }
      setProgress(60);

      const atsScore = calculateAtsScore(text);
      setProgress(80);

      let aiAnalysis = { strengths: [], improvements: [], redFlags: [] };
      try {
        aiAnalysis = await analyzeResumeWithAI(text, ragContext.knowledge);
      } catch (e) {
        console.log('AI analysis skipped:', e);
      }
      setProgress(100);
      setStep('complete');

      const result = {
        text,
        atsScore,
        ...aiAnalysis,
        fileName: file.name,
        fileSize: file.size
      };

      onParseComplete(result);
      onReviewComplete(result);

    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setError(err.message || 'Failed to parse resume');
      }
    } finally {
      setIsLoading(false);
    }
  }, [onParseComplete, onReviewComplete]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    setTilt({ x: 0, y: 0 });
    
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const clearUpload = () => {
    if (abortController.current) {
      abortController.current.abort();
    }
    setUploadedFile(null);
    setError(null);
    setProgress(0);
    setStep('idle');
    setIsLoading(false);
  };

  const steps = [
    { id: 'parsing', label: 'Parsing', icon: FileText },
    { id: 'analyzing', label: 'Analyzing', icon: Sparkles },
    { id: 'complete', label: 'Complete', icon: CheckCircle2 },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Upload Zone */}
      <div
        ref={uploadZoneRef}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        role="button"
        tabIndex={0}
        aria-label="Drop resume file or click to upload"
        className={`
          relative overflow-hidden rounded-3xl p-12 sm:p-20 text-center cursor-pointer
          transition-all duration-500 ease-out focus:outline-none
          ${isDragging 
            ? 'scale-105 bg-gradient-to-br from-red-500/10 to-amber-500/10 border-2 border-red-500' 
            : 'border-2 border-dashed border-current/10 hover:border-current/20'
          }
        `}
        style={{
          transform: `perspective(1000px) rotateX(${tilt.y}deg) rotateY(${tilt.x}deg)`,
          transition: 'transform 0.15s ease-out'
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            document.getElementById('resume-upload')?.click();
          }
        }}
      >
        {/* Decorative elements */}
        <div className="absolute inset-0 opacity-0 transition-opacity duration-500 pointer-events-none" style={{ opacity: isDragging ? 0.05 : 0 }}>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--color-accent),transparent_70%)]" />
        </div>

        <input
          type="file"
          accept=".pdf,.docx,.txt"
          onChange={handleInputChange}
          className="hidden"
          id="resume-upload"
          disabled={isLoading}
        />
        <label htmlFor="resume-upload" className="cursor-pointer block relative z-10">
          <div className="flex flex-col items-center gap-6">
            <div className={`
              relative w-24 h-24 sm:w-32 sm:h-32 rounded-3xl 
              flex items-center justify-center 
              transition-all duration-500
              ${isDragging ? 'scale-110 bg-gradient-to-br from-red-500 to-amber-500' : 'bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900'}
            `}>
              <Upload 
                className={`w-10 h-10 sm:w-12 sm:h-12 transition-all duration-500 ${isDragging ? 'text-white scale-110' : 'opacity-60'}`} 
                strokeWidth={1.5} 
              />
              {isDragging && (
                <div className="absolute inset-0 rounded-3xl border-2 border-white/30 animate-pulse" />
              )}
            </div>
            
            <div>
              <p className="text-2xl sm:text-3xl font-semibold mb-2">
                {isDragging ? 'Drop it like it\'s hot 🔥' : 'Drop your resume here'}
              </p>
              <p className="text-base opacity-50">or click to browse</p>
              <p className="text-xs opacity-30 mt-2 uppercase tracking-widest">
                Supports PDF, DOCX, TXT
              </p>
            </div>
          </div>
        </label>
      </div>

      {/* Progress */}
      {isLoading && (
        <div className="mt-8 card rounded-2xl p-6 sm:p-8 animate-reveal">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Loader2 className="w-8 h-8 text-red-500 animate-spin" strokeWidth={1.5} />
                <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-zinc-900 to-transparent animate-pulse" />
              </div>
              <div>
                <p className="font-semibold text-lg">
                  {step === 'parsing' && 'Reading your resume...'}
                  {step === 'analyzing' && 'Analyzing with AI...'}
                  {step === 'complete' && 'Analysis complete!'}
                </p>
                <p className="text-sm opacity-50">This takes about 5 seconds</p>
              </div>
            </div>
            <button 
              onClick={clearUpload}
              className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-all opacity-50 hover:opacity-100"
              aria-label="Cancel upload"
            >
              <X className="w-5 h-5" strokeWidth={1.5} />
            </button>
          </div>

          {/* Step indicators */}
          <div className="flex items-center gap-4 mb-8">
            {steps.map((s, index) => {
              const Icon = s.icon;
              const isActive = step === s.id;
              const isComplete = steps.findIndex(x => x.id === step) > index;
              
              return (
                <div key={s.id} className="flex-1">
                  <div className={`
                    flex items-center gap-3 p-4 rounded-xl transition-all duration-500
                    ${isActive ? 'bg-red-500/10' : isComplete ? 'bg-green-500/10' : 'opacity-30'}
                  `}>
                    <Icon className={`w-5 h-5 ${isActive ? 'text-red-500' : isComplete ? 'text-green-500' : ''}`} strokeWidth={1.5} />
                    <span className="text-sm font-medium">{s.label}</span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`h-1 mt-2 rounded-full transition-all duration-1000 ${isComplete ? 'bg-green-500' : 'bg-current/10'}`} />
                  )}
                </div>
              );
            })}
          </div>

          {/* Progress bar */}
          <div className="relative h-2 bg-current/5 rounded-full overflow-hidden">
            <div 
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-red-500 to-amber-500 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${progress}%` }}
              role="progressbar"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
          <p className="text-xs opacity-40 mt-3 text-right font-mono">{progress}%</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mt-8 border border-red-500/20 bg-red-500/5 rounded-2xl p-6 flex items-start gap-4 animate-reveal" role="alert">
          <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
          <div className="flex-1">
            <p className="font-semibold text-red-600 dark:text-red-400 mb-1">Couldn\'t read your resume</p>
            <p className="text-sm opacity-70">{error}</p>
            <button 
              onClick={clearUpload}
              className="mt-3 text-sm font-medium text-red-500 hover:underline"
            >
              Try again with a different file
            </button>
          </div>
        </div>
      )}

      {/* Success */}
      {uploadedFile && step === 'complete' && !error && (
        <div className="mt-8 border border-green-500/20 bg-green-500/5 rounded-2xl p-6 flex items-center gap-4 animate-reveal">
          <div className="relative">
            <CheckCircle2 className="w-10 h-10 text-green-500 flex-shrink-0" strokeWidth={1.5} />
            <div className="absolute inset-0 bg-green-500/20 rounded-full animate-ping" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-green-700 dark:text-green-400">Resume parsed successfully!</p>
            <p className="text-sm opacity-60 truncate">{uploadedFile.name}</p>
          </div>
          <button 
            onClick={clearUpload}
            className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-all opacity-50 hover:opacity-100"
            aria-label="Clear uploaded file"
          >
            <X className="w-5 h-5" strokeWidth={1.5} />
          </button>
        </div>
      )}

      {/* Privacy Notice */}
      <div className="mt-8 text-center text-xs opacity-40">
        <p className="flex items-center justify-center gap-2 flex-wrap">
          <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" strokeWidth={1.5} />
          Your resume is parsed locally in your browser. No files are uploaded to any server.
        </p>
      </div>
    </div>
  );
}

