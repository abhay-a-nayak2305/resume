import { useState } from 'react';
import { Settings, Moon, Sun, X, Info, Github, ExternalLink } from 'lucide-react';
import { useLocalStorage } from '../../hooks/useResumeHistory';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [darkMode, setDarkMode] = useLocalStorage('dark-mode', false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="card rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto animate-reveal">
        <div className="flex items-center justify-between p-8 border-b border-current/5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-amber-500 rounded-xl flex items-center justify-center transform -rotate-3">
              <Settings className="w-6 h-6 text-white" strokeWidth={1.5} />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Settings</h2>
              <p className="text-sm opacity-50 mt-0.5">Configure your preferences</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-3 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-all"
          >
            <X className="w-5 h-5" strokeWidth={1.5} />
          </button>
        </div>

        <div className="p-8 space-y-8">
          {/* Appearance */}
          <div>
            <h3 className="text-sm uppercase tracking-widest opacity-50 font-semibold mb-4">Appearance</h3>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="w-full flex items-center justify-between p-5 hover:bg-black/5 dark:hover:bg-white/5 rounded-2xl transition-all duration-300 group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-black/5 dark:bg-white/5 rounded-xl flex items-center justify-center">
                  {darkMode ? <Moon className="w-5 h-5" strokeWidth={1.5} /> : <Sun className="w-5 h-5" strokeWidth={1.5} />}
                </div>
                <div className="text-left">
                  <span className="font-semibold block">Dark Mode</span>
                  <span className="text-sm opacity-50">Switch between light and dark themes</span>
                </div>
              </div>
              <div className={`
                relative w-14 h-8 rounded-full transition-all duration-300 cursor-pointer
                ${darkMode ? 'bg-gradient-to-r from-red-500 to-amber-500' : 'bg-current/10'}
              `}>
                <div className={`
                  absolute top-1 w-6 h-6 bg-white rounded-full shadow-lg transition-all duration-300
                  ${darkMode ? 'left-7' : 'left-1'}
                `} />
              </div>
            </button>
          </div>

          {/* About */}
          <div className="border-t border-current/5 pt-8">
            <div className="flex items-center gap-4 mb-4">
              <Info className="w-5 h-5 opacity-50" strokeWidth={1.5} />
              <p className="text-sm opacity-50">Resume.AI v1.0</p>
            </div>
            <p className="text-sm opacity-40 leading-relaxed">
              Upload your resume and get AI-powered feedback from 1000+ successful resumes. 
              All parsing happens locally in your browser.
            </p>
            
            <div className="flex gap-3 mt-6">
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" 
                 className="flex items-center gap-2 text-sm opacity-50 hover:opacity-100 transition-opacity">
                <Github className="w-4 h-4" strokeWidth={1.5} />
                Source Code
              </a>
              <a href="https://openrouter.ai" target="_blank" rel="noopener noreferrer"
                 className="flex items-center gap-2 text-sm opacity-50 hover:opacity-100 transition-opacity">
                <ExternalLink className="w-4 h-4" strokeWidth={1.5} />
                Powered by OpenRouter
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
