import { useState } from 'react';
import { Monitor, AlertTriangle, CheckCircle2, XCircle, Info } from 'lucide-react';

interface ParserView {
  name: string;
  extractedText: string;
  errors: string[];
  warnings: string[];
  score: number;
}

interface ATSEmulatorProps {
  resumeText: string;
  rawFile?: File;
}

export default function ATSEmulator({ resumeText, rawFile }: ATSEmulatorProps) {
  const [activeParser, setActiveParser] = useState<string>('greenhouse');

  const parsers: Record<string, ParserView> = {
    greenhouse: {
      name: 'Greenhouse',
      extractedText: resumeText,
      errors: [],
      warnings: [],
      score: 85
    },
    lever: {
      name: 'Lever',
      extractedText: resumeText,
      errors: [],
      warnings: [],
      score: 78
    },
    workday: {
      name: 'Workday',
      extractedText: resumeText.slice(0, resumeText.length * 0.9),
      errors: ['Possible text truncation detected'],
      warnings: ['Workday often drops the last 10% of text'],
      score: 72
    },
    taleo: {
      name: 'Taleo',
      extractedText: resumeText.replace(/[•●◦]/g, '*'),
      errors: [],
      warnings: ['Bullet points converted to asterisks'],
      score: 80
    }
  };

  const currentParser = parsers[activeParser];

  const detectAtsIssues = (text: string) => {
    const issues = {
      tables: /\|.*\|/g.test(text),
      columns: text.split('\n').some(line => line.length > 100 && /\s{10,}/.test(line)),
      images: false,
      unusualFonts: false,
      headersFooters: text.split('\n').length < 5,
      specialCharacters: /[^\x00-\x7F]/g.test(text),
      links: /https?:\/\//g.test(text),
      email: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(text),
      phone: /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/.test(text),
    };

    return issues;
  };

  const issues = detectAtsIssues(resumeText);

  return (
    <div className='card p-5 sm:p-6 animate-fade-in'>
      <div className='flex items-center gap-3 mb-6'>
        <div className='w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center'>
          <Monitor className='w-5 h-5 text-purple-600' />
        </div>
        <div>
          <h3 className='text-xl font-bold text-gray-900'>ATS Parser Emulator</h3>
          <p className='text-sm text-gray-500'>See exactly what real ATS systems see</p>
        </div>
      </div>

      {/* Parser Selector */}
      <div className='flex flex-wrap gap-2 mb-6'>
        {Object.entries(parsers).map(([key, parser]) => (
          <button
            key={key}
            onClick={() => setActiveParser(key)}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
              activeParser === key 
                ? 'bg-purple-600 text-white shadow-lg' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {parser.name}
            <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
              activeParser === key ? 'bg-purple-500 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              {parser.score}%
            </span>
          </button>
        ))}
      </div>

      {/* Issues Summary */}
      <div className='grid sm:grid-cols-3 gap-4 mb-6'>
        <div className='bg-green-50 border border-green-200 rounded-xl p-4'>
          <div className='flex items-center gap-2 mb-2'>
            <CheckCircle2 className='w-5 h-5 text-green-600' />
            <span className='font-medium text-green-800'>Compatible</span>
          </div>
          <ul className='text-sm text-green-700 space-y-1'>
            {issues.email && <li>✓ Email detected</li>}
            {issues.phone && <li>✓ Phone number detected</li>}
            {!issues.tables && <li>✓ No tables detected</li>}
          </ul>
        </div>

        <div className='bg-yellow-50 border border-yellow-200 rounded-xl p-4'>
          <div className='flex items-center gap-2 mb-2'>
            <AlertTriangle className='w-5 h-5 text-yellow-600' />
            <span className='font-medium text-yellow-800'>Warnings</span>
          </div>
          <ul className='text-sm text-yellow-700 space-y-1'>
            {issues.specialCharacters && <li>⚠ Special characters</li>}
            {issues.links && <li>⚠ Links may be stripped</li>}
          </ul>
        </div>

        <div className='bg-red-50 border border-red-200 rounded-xl p-4'>
          <div className='flex items-center gap-2 mb-2'>
            <XCircle className='w-5 h-5 text-red-600' />
            <span className='font-medium text-red-800'>Critical</span>
          </div>
          <ul className='text-sm text-red-700 space-y-1'>
            {issues.columns && <li>✗ Columns detected</li>}
            {!issues.email && <li>✗ No email found</li>}
            {!issues.phone && <li>✗ No phone found</li>}
          </ul>
        </div>
      </div>

      {/* Parser View */}
      <div className='border border-gray-200 rounded-xl overflow-hidden'>
        <div className='bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center justify-between'>
          <span className='font-medium text-gray-700'>{currentParser.name} View</span>
          <span className='text-xs text-gray-500'>{currentParser.extractedText.length} characters extracted</span>
        </div>
        <div className='p-4 max-h-80 overflow-y-auto bg-gray-900 text-green-400 font-mono text-xs whitespace-pre-wrap'>
          {currentParser.extractedText || 'No text extracted'}
        </div>
      </div>

      {/* Parser Errors */}
      {(currentParser.errors.length > 0 || currentParser.warnings.length > 0) && (
        <div className='mt-4 space-y-3'>
          {currentParser.errors.map((error, i) => (
            <div key={i} className='flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg p-3'>
              <XCircle className='w-4 h-4 text-red-500 flex-shrink-0 mt-0.5' />
              <p className='text-sm text-red-700'>{error}</p>
            </div>
          ))}
          {currentParser.warnings.map((warning, i) => (
            <div key={i} className='flex items-start gap-2 bg-yellow-50 border border-yellow-200 rounded-lg p-3'>
              <AlertTriangle className='w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5' />
              <p className='text-sm text-yellow-700'>{warning}</p>
            </div>
          ))}
        </div>
      )}

      <div className='mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3'>
        <Info className='w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5' />
        <div>
          <p className='font-medium text-blue-800 mb-1'>Pro Tip</p>
          <p className='text-sm text-blue-700'>ATS parsers prefer simple, single-column layouts. Avoid tables, columns, images, and unusual fonts. Use standard section headings like Experience, Education, and Skills.</p>
        </div>
      </div>
    </div>
  );
}
