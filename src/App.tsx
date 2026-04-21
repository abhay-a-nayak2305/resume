import { useState, useEffect, useRef, useCallback } from 'react';
import { Upload, FileText, Sparkles, BarChart3, Settings, Clock, Zap, ArrowDown } from 'lucide-react';
import ResumeUploader from './components/upload/ResumeUploader';
import ResumeReview from './components/review/ResumeReview';
import ResumeGenerator from './components/generator/ResumeGenerator';
import JobMatcher from './components/job-matcher/JobMatcher';
import SettingsModal from './components/ui/SettingsModal';
import { useLocalStorage } from './hooks/useResumeHistory';

function App() {
  const [activeTab, setActiveTab] = useState<'review' | 'generate' | 'match' | 'history'>('review');
  const [parsedResume, setParsedResume] = useState<any>(null);
  const [reviewResult, setReviewResult] = useState<any>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [darkMode, setDarkMode] = useLocalStorage('dark-mode', false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [cursorHovering, setCursorHovering] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [scrollVelocity, setScrollVelocity] = useState(0);
  
  const cursorRef = useRef<HTMLDivElement>(null);
  const cursorDotRef = useRef<HTMLDivElement>(null);
  const lastScrollTime = useRef<number>(Date.now());
  const lastScrollY = useRef<number>(0);

  // Scroll reveal observer - fixed for tab switching
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.1 });

    // Observe all scroll reveal elements
    const observeElements = () => {
      document.querySelectorAll('.scroll-reveal, .scroll-reveal-left, .scroll-reveal-right').forEach(el => {
        observer.observe(el);
      });
      
      // Fallback: Force reveal any elements that are still hidden after 500ms
      setTimeout(() => {
        document.querySelectorAll('.scroll-reveal, .scroll-reveal-left, .scroll-reveal-right').forEach(el => {
          if (!el.classList.contains('visible')) {
            el.classList.add('visible');
          }
        });
      }, 500);
    };

    // Initial observation
    observeElements();

    // Also observe when DOM changes (for tab content)
    const mutationObserver = new MutationObserver(observeElements);
    mutationObserver.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
    };
  }, [activeTab]);



  useEffect(() => {
    setIsLoaded(true);
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Custom cursor tracking
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'BUTTON' || target.tagName === 'A' || target.closest('button') || target.closest('a')) {
        setCursorHovering(true);
      } else {
        setCursorHovering(false);
      }
    };

    const handleScroll = () => {
      const now = Date.now();
      const deltaTime = now - lastScrollTime.current;
      const deltaScroll = window.scrollY - lastScrollY.current;
      
      setScrollVelocity(deltaScroll / deltaTime * 10);
      setScrollY(window.scrollY);
      
      lastScrollTime.current = now;
      lastScrollY.current = window.scrollY;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseover', handleMouseOver);
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseover', handleMouseOver);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [darkMode]);

  const handleReviewComplete = (result: any) => {
    setReviewResult(result);
  };

  const tabs = [
    { id: 'review', label: 'Review Resume', icon: BarChart3, description: 'AI-powered analysis' },
    { id: 'generate', label: 'Generate Resume', icon: Sparkles, description: 'Build from scratch' },
    { id: 'match', label: 'Job Matcher', icon: Upload, description: 'Compare to JD' },
    { id: 'history', label: 'History', icon: Clock, description: 'Past reviews' },
  ];

  return (
    <div className="min-h-screen relative transition-colors duration-700">
      {/* Custom Cursor */}
      <div 
        ref={cursorRef}
        className={`custom-cursor ${cursorHovering ? 'hovering' : ''}`}
        style={{ 
          left: mousePos.x, 
          top: mousePos.y,
          opacity: isLoaded ? 1 : 0,
          transform: `translate(-50%, -50%) translate(${scrollVelocity * 0.1}px, ${scrollVelocity * 0.05}px)`
        }}
      />
      <div 
        ref={cursorDotRef}
        className="custom-cursor-dot"
        style={{ 
          left: mousePos.x, 
          top: mousePos.y,
          opacity: isLoaded ? 1 : 0 
        }}
      />

      {/* Atmospheric Grain Overlay */}
      <div className="grain-overlay" />

      {/* Decorative Background Elements with Parallax */}
      <div className="fixed top-0 right-0 w-1/3 h-screen opacity-5 pointer-events-none">
        <div 
          className="absolute top-20 right-20 w-96 h-96 rounded-full bg-gradient-to-br from-red-500 to-amber-500 blur-3xl animate-float"
          style={{ transform: `translateY(${mousePos.y * 0.02 + scrollY * 0.1}px)` }}
        />
      </div>
      <div className="fixed bottom-0 left-0 w-1/3 h-screen opacity-5 pointer-events-none">
        <div 
          className="absolute bottom-20 left-20 w-64 h-64 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 blur-3xl animate-float animate-stagger-2"
          style={{ transform: `translateY(${-mousePos.y * 0.01 - scrollY * 0.05}px)` }}
        />
      </div>

      {/* Decorative floating elements */}
      <div className="fixed top-1/4 left-10 pointer-events-none opacity-30 animate-float animate-stagger-3" style={{ transform: `translateY(${scrollY * 0.2}px)` }}>
        <div className="decoration-dot" />
      </div>
      <div className="fixed top-1/3 right-16 pointer-events-none opacity-30 animate-float animate-stagger-4" style={{ transform: `translateY(${scrollY * 0.15}px)` }}>
        <div className="decoration-dot" />
      </div>

      {/* Header */}
      <header className={isLoaded ? 'animate-reveal' : 'opacity-0'}>
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-amber-500 flex items-center justify-center transform -rotate-3 shadow-xl">
                  <FileText className="w-7 h-7 text-white" strokeWidth={1.5} />
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white dark:bg-zinc-900 border-2 border-current flex items-center justify-center">
                  <Zap className="w-3 h-3" />
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">
                  Resume<span className="text-red-500">.</span>AI
                </h1>
                <p className="text-sm opacity-60 mt-0.5 font-light">Intelligent Career Advancement</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
               <button 
                onClick={() => setDarkMode(!darkMode)}
                className="p-3 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-all duration-300"
              >
                {darkMode ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>
               <button 
                onClick={() => setSettingsOpen(true)}
                className="p-3 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-all duration-300"
              >
                <Settings className="w-5 h-5" strokeWidth={1.5} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section - Only on review tab when no result */}
      {activeTab === 'review' && !reviewResult && (
        <div className={`max-w-4xl mx-auto px-6 py-24 md:py-32 text-center ${isLoaded ? 'animate-reveal animate-stagger-1' : 'opacity-0'}`}>
          <h2 className="text-6xl md:text-8xl font-bold leading-tight mb-8 text-balance">
            <span className="text-reveal">Your Resume,</span>
            <br />
            <span className="hero-gradient-text text-reveal text-reveal-stagger-1">
              Supercharged
            </span>
          </h2>
          <p className="text-xl opacity-60 max-w-2xl mx-auto mb-12 font-light leading-relaxed text-balance text-reveal text-reveal-stagger-2">
            Upload your resume and get AI-powered feedback from 1000+ successful resumes. 
            ATS optimization, recruiter insights, and one-click improvements.
          </p>
          
          <div className="flex justify-center animate-reveal animate-stagger-3">
            <ArrowDown className="w-6 h-6 opacity-30 animate-bounce" />
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className={`max-w-7xl mx-auto px-6 mb-12 ${isLoaded ? 'animate-reveal animate-stagger-2' : 'opacity-0'}`}>
        <div className="flex flex-wrap justify-center gap-1 p-1 bg-black/5 dark:bg-white/5 rounded-2xl">
          {tabs.map((tab, index) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                
              }}
             className={`relative flex flex-col items-center gap-1 px-6 py-4 rounded-xl transition-all duration-300 min-w-[140px] ${
                activeTab === tab.id 
                  ? 'bg-white dark:bg-zinc-900 shadow-lg shadow-black/10' 
                  : 'hover:bg-black/5 dark:hover:bg-white/10'
              }`}
            >
              <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-red-500' : 'opacity-60'}`} strokeWidth={1.5} />
              <span className={`text-xs font-semibold uppercase tracking-widest ${activeTab === tab.id ? '' : 'opacity-60'}`}>
                {tab.label}
              </span>
              {activeTab === tab.id && (
                <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full bg-red-500" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Decorative line */}
      <div className="max-w-4xl mx-auto mb-12 scroll-reveal">
        <div className="decoration-line" />
      </div>

      {/* Main Content */}
      <main className={`max-w-7xl mx-auto px-6 pb-24 ${isLoaded ? 'animate-reveal animate-stagger-3' : 'opacity-0'}`}>
        {activeTab === 'review' && (
          <div>
            {!reviewResult ? (
              <div className="scroll-reveal">
                <ResumeUploader 
                  onParseComplete={setParsedResume}
                  onReviewComplete={handleReviewComplete}
                />
              </div>
            ) : (
              <div className="animate-reveal">
                 <button 
                  onClick={() => { setReviewResult(null); setParsedResume(null); }}
                  className="mb-8 inline-flex items-center gap-2 px-4 py-2 rounded-full border border-current/20 hover:bg-black/5 dark:hover:bg-white/10 transition-all text-sm font-medium opacity-70 hover:opacity-100"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Upload another resume
                </button>
                <ResumeReview review={reviewResult} />
              </div>
            )}
          </div>
        )}
        {activeTab === 'generate' && <div className="scroll-reveal"><ResumeGenerator /></div>}
        {activeTab === 'match' && <div className="scroll-reveal"><JobMatcher /></div>}
        {activeTab === 'history' && (
          <div className="max-w-4xl mx-auto scroll-reveal">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-3">Resume History</h2>
              <p className="text-lg opacity-60 font-light">Your past resume reviews and scores</p>
            </div>
            <div className="text-center py-20 card rounded-3xl">
              <Clock className="w-16 h-16 mx-auto mb-6 opacity-20" strokeWidth={1} />
              <p className="text-lg opacity-60 font-light mb-2">No resume history yet</p>
              <p className="text-sm opacity-40">Your reviewed resumes will appear here</p>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className={`border-t border-current/5 py-16 ${isLoaded ? 'animate-reveal animate-stagger-4' : 'opacity-0'}`}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-amber-500 flex items-center justify-center transform -rotate-3">
                <FileText className="w-5 h-5 text-white" strokeWidth={2} />
              </div>
              <div>
                <span className="font-semibold text-lg">Resume.AI</span>
                <p className="text-xs opacity-40">Intelligent Career Advancement</p>
              </div>
            </div>
            <p className="text-sm opacity-40 text-center md:text-right max-w-md">
              🔒 Your resume never leaves your browser. All parsing happens locally.
            </p>
          </div>
        </div>
      </footer>

      <SettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
}

export default App;

