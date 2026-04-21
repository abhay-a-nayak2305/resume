import { useState } from 'react';
import { GitCompare, ArrowUp, ArrowDown, Minus, CheckCircle2, XCircle } from 'lucide-react';

interface VersionComparisonProps {
  resume1: any;
  resume2: any;
}

export default function VersionComparison({ resume1, resume2 }: VersionComparisonProps) {
  const [viewMode, setViewMode] = useState<'side-by-side' | 'unified'>('side-by-side');

  const calculateScoreDelta = (a: number, b: number) => {
    const delta = b - a;
    if (delta > 5) return { value: delta, direction: 'up', color: 'text-green-600' };
    if (delta < -5) return { value: delta, direction: 'down', color: 'text-red-600' };
    return { value: delta, direction: 'neutral', color: 'text-gray-600' };
  };

  const overallDelta = calculateScoreDelta(resume1?.atsScore?.overall || 0, resume2?.atsScore?.overall || 0);

  return (
    <div className='card p-5 sm:p-6 animate-fade-in'>
      <div className='flex items-center justify-between mb-6'>
        <div className='flex items-center gap-3'>
          <GitCompare className='w-5 h-5 text-gray-600 dark:text-gray-300' />
          <h3 className='text-lg sm:text-xl font-bold text-gray-900 dark:text-white'>Version Comparison</h3>
        </div>
        <div className='flex gap-2'>
          <button 
            onClick={() => setViewMode('side-by-side')}
            className="px-3 py-1.5 rounded-lg text-sm"
          >
            Side by Side
          </button>
          <button 
            onClick={() => setViewMode('unified')}
            className="px-3 py-1.5 rounded-lg text-sm"
          >
            Unified
          </button>
        </div>
      </div>

      {/* Score Overview */}
      <div className='grid sm:grid-cols-3 gap-4 mb-6'>
        <div className='bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 text-center'>
          <p className='text-sm text-gray-500 dark:text-gray-400 mb-1'>Version 1</p>
          <p className='text-3xl font-bold text-gray-900 dark:text-white'>{resume1?.atsScore?.overall || 0}/100</p>
        </div>
        <div className='bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 text-center flex flex-col items-center justify-center'>
          <div className="text-3xl font-bold flex items-center gap-2">
            {overallDelta.direction === 'up' && <ArrowUp className='w-6 h-6' />}
            {overallDelta.direction === 'down' && <ArrowDown className='w-6 h-6' />}
            {overallDelta.direction === 'neutral' && <Minus className='w-6 h-6' />}
            {overallDelta.value > 0 ? `+${overallDelta.value}` : overallDelta.value}
          </div>
          <p className='text-sm text-gray-500 dark:text-gray-400 mt-1'>Change</p>
        </div>
        <div className='bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 text-center'>
          <p className='text-sm text-gray-500 dark:text-gray-400 mb-1'>Version 2</p>
          <p className='text-3xl font-bold text-gray-900 dark:text-white'>{resume2?.atsScore?.overall || 0}/100</p>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className='space-y-3 mb-6'>
        {Object.entries(resume1?.atsScore?.breakdown || {}).map(([category, score1]) => {
          const score2 = resume2?.atsScore?.breakdown?.[category] || 0;
          const delta = calculateScoreDelta(score1 as number, score2);
          
          return (
            <div key={category} className='flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg'>
              <span className='font-medium text-gray-900 dark:text-white capitalize'>{category}</span>
              <div className='flex items-center gap-4'>
                <span className='text-gray-600 dark:text-gray-300'>{score1 as number}</span>
                <span className="font-medium flex items-center gap-1">
                  {delta.direction === 'up' && <ArrowUp className='w-4 h-4' />}
                  {delta.direction === 'down' && <ArrowDown className='w-4 h-4' />}
                  {delta.value > 0 ? `+${delta.value}` : delta.value}
                </span>
                <span className='text-gray-600 dark:text-gray-300'>{score2}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Improvements Summary */}
      <div className='grid sm:grid-cols-2 gap-4'>
        <div className='bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4'>
          <h4 className='font-medium text-green-800 dark:text-green-200 mb-3 flex items-center gap-2'>
            <CheckCircle2 className='w-4 h-4' />
            Improvements
          </h4>
          <ul className='space-y-2'>
            <li className='text-sm text-green-700 dark:text-green-300 flex items-start gap-2'>
              <CheckCircle2 className='w-4 h-4 mt-0.5 flex-shrink-0' />
              Better keyword optimization
            </li>
            <li className='text-sm text-green-700 dark:text-green-300 flex items-start gap-2'>
              <CheckCircle2 className='w-4 h-4 mt-0.5 flex-shrink-0' />
              Improved ATS formatting
            </li>
          </ul>
        </div>
        <div className='bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4'>
          <h4 className='font-medium text-red-800 dark:text-red-200 mb-3 flex items-center gap-2'>
            <XCircle className='w-4 h-4' />
            Areas Still Needing Work
          </h4>
          <ul className='space-y-2'>
            <li className='text-sm text-red-700 dark:text-red-300 flex items-start gap-2'>
              <XCircle className='w-4 h-4 mt-0.5 flex-shrink-0' />
              Quantified achievements still missing
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

