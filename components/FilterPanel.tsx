import React from 'react';
import { FilterSettings, FilterStyle, FilterSubject } from '../types';

interface FilterPanelProps {
  filters: FilterSettings;
  onChange: (newFilters: FilterSettings) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  apiKey?: string;
  setApiKey?: (k: string) => void;
}

const FilterPanel: React.FC<FilterPanelProps> = ({ filters, onChange, isOpen, setIsOpen, apiKey, setApiKey }) => {
  if (!isOpen) return null;

  const handleChange = (key: keyof FilterSettings, value: any) => {
    onChange({ ...filters, [key]: value });
  };

  return (
    <div className="mb-6 p-6 bg-white dark:bg-zinc-800 rounded-lg shadow-inner border border-stone-200 dark:border-zinc-700 animate-fade-in-down">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold font-serif text-ink-800 dark:text-stone-200">
           过滤与偏好
        </h3>
        <button 
          onClick={() => setIsOpen(false)}
          className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>
      {/* API Key Input */}
      <div className="mb-4">
        <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider">API Key (可选)</label>
        <div className="flex items-center mt-2 gap-2">
          <input
            type="password"
            value={apiKey || ''}
            onChange={(e) => setApiKey && setApiKey(e.target.value)}
            placeholder="在此输入 Gemini API Key，保存在本地"
            className="flex-1 p-2 bg-stone-50 dark:bg-zinc-900 border border-stone-200 dark:border-zinc-700 rounded-md text-stone-700 dark:text-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-ink-400 dark:focus:ring-jade-600"
          />
          <button
            onClick={() => setApiKey && setApiKey('')}
            className="px-3 py-2 text-sm bg-stone-100 dark:bg-zinc-700 rounded-md"
          >清除</button>
        </div>
        <p className="text-xs text-stone-400 dark:text-stone-500 mt-2">提供后会在本地保存，仅用于当前浏览器会话。</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Style */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider">表现形式</label>
          <select 
            value={filters.style}
            onChange={(e) => handleChange('style', e.target.value)}
            className="w-full p-2 bg-stone-50 dark:bg-zinc-900 border border-stone-200 dark:border-zinc-700 rounded-md text-stone-700 dark:text-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-ink-400 dark:focus:ring-jade-600"
          >
            {Object.values(FilterStyle).map(style => (
              <option key={style} value={style}>{style}</option>
            ))}
          </select>
        </div>

        {/* Subject */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider">主体类型</label>
          <select 
            value={filters.subject}
            onChange={(e) => handleChange('subject', e.target.value)}
            className="w-full p-2 bg-stone-50 dark:bg-zinc-900 border border-stone-200 dark:border-zinc-700 rounded-md text-stone-700 dark:text-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-ink-400 dark:focus:ring-jade-600"
          >
            {Object.values(FilterSubject).map(subject => (
              <option key={subject} value={subject}>{subject}</option>
            ))}
          </select>
        </div>

        {/* Toggles */}
        <div className="space-y-2">
           <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider">联想逻辑</label>
           <div className="flex items-center space-x-2 mt-2">
              <input 
                type="checkbox" 
                id="homophone"
                checked={filters.allowHomophone} 
                onChange={(e) => handleChange('allowHomophone', e.target.checked)}
                className="rounded text-ink-600 focus:ring-ink-500 dark:bg-zinc-900 dark:border-zinc-700"
              />
              <label htmlFor="homophone" className="text-sm text-stone-700 dark:text-stone-300 cursor-pointer">
                允许谐音/形近联想
              </label>
           </div>
        </div>

        {/* Exclusion */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider">内容排除</label>
          <input 
            type="text" 
            value={filters.excludeContent} 
            onChange={(e) => handleChange('excludeContent', e.target.value)}
            placeholder="例如: 恐怖, 血腥..."
            className="w-full p-2 bg-stone-50 dark:bg-zinc-900 border border-stone-200 dark:border-zinc-700 rounded-md text-stone-700 dark:text-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-ink-400 dark:focus:ring-jade-600"
          />
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;
