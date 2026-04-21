import { useState } from 'react';
import { Linkedin, Loader2, CheckCircle2, AlertCircle, ExternalLink } from 'lucide-react';

interface LinkedInImportProps {
  onImportComplete: (data: any) => void;
}

export default function LinkedInImport({ onImportComplete }: LinkedInImportProps) {
  const [profileUrl, setProfileUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImport = async () => {
    if (!profileUrl) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'linkedin.import',
          profileUrl
        })
      });

      if (!response.ok) throw new Error('Failed to import profile');
      
      const data = await response.json();
      onImportComplete(data);
    } catch (err: any) {
      setError(err.message || 'Failed to import LinkedIn profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='border border-current/10 rounded-3xl p-6 mb-8 bg-gradient-to-br from-blue-500/5 to-transparent'>
      <div className='flex items-center gap-4 mb-6'>
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center transform -rotate-3 shadow-lg shadow-blue-500/20">
          <Linkedin className='w-6 h-6 text-white' strokeWidth={1.5} />
        </div>
        <div>
          <h4 className='text-xl font-bold'>Import from LinkedIn</h4>
          <p className='text-sm opacity-50'>Pull experience and personal details automatically</p>
        </div>
      </div>
      
      <div className='flex flex-col sm:flex-row gap-4'>
        <input
          type='url'
          className='input rounded-2xl flex-1'
          value={profileUrl}
          onChange={(e) => setProfileUrl(e.target.value)}
          placeholder='https://linkedin.com/in/your-profile'
        />
        <button
          onClick={handleImport}
          disabled={isLoading || !profileUrl}
          className='btn btn-primary rounded-2xl px-8 flex items-center justify-center gap-2'
        >
          {isLoading ? (
            <Loader2 className='w-5 h-5 animate-spin' strokeWidth={1.5} />
          ) : (
            <ExternalLink className='w-5 h-5' strokeWidth={1.5} />
          )}
          <span className="font-semibold uppercase tracking-widest text-xs">
            {isLoading ? 'Importing...' : 'Import'}
          </span>
        </button>
      </div>

      {error && (
        <div className='flex items-center gap-3 mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-600 dark:text-red-400'>
          <AlertCircle className='w-5 h-5 flex-shrink-0' strokeWidth={1.5} />
          <p className="text-sm">{error}</p>
        </div>
      )}
    </div>
  );
}
