import React, { useState, useCallback } from 'react';
import { 
  Theme, 
  SearchResult, 
  Variant as VariantType,
  FilterSettings
} from './types';
import { PRESET_VARIANTS, DEFAULT_FILTERS } from './constants';
import { generateAssociation } from './services/geminiService';

import FilterPanel from './components/FilterPanel';
import ResultCard from './components/ResultCard';
import VariantManager from './components/VariantManager';

const App: React.FC = () => {
  // --- State ---
  const [theme, setTheme] = useState<Theme>('ink');
  const [inputValue, setInputValue] = useState('');
  const RESULTS_KEY = 'hieroglyph_results';
  const MAX_RESULTS = 100;
  const [results, setResults] = useState<SearchResult[]>(() => {
    try {
      const raw = window.localStorage.getItem(RESULTS_KEY);
      return raw ? (JSON.parse(raw) as SearchResult[]) : [];
    } catch (e) {
      return [];
    }
  });
  const [loading, setLoading] = useState(false);
  const [currentVariantId, setCurrentVariantId] = useState<string>('daily');
  const [customVariants, setCustomVariants] = useState<VariantType[]>(() => {
    try {
      const raw = window.localStorage.getItem('hieroglyph_custom_variants');
      return raw ? (JSON.parse(raw) as VariantType[]) : [];
    } catch (e) {
      return [];
    }
  });
  const [filters, setFilters] = useState<FilterSettings>(DEFAULT_FILTERS);
  const [apiKey, setApiKey] = useState<string>(() => {
    try {
      return window.localStorage.getItem('hieroglyph_api_key') || '';
    } catch (e) {
      return '';
    }
  });
  const [showFilters, setShowFilters] = useState(false);
  
  // --- Helpers ---
  const getCurrentVariant = useCallback(() => {
    return [...PRESET_VARIANTS, ...customVariants].find(v => v.id === currentVariantId) || PRESET_VARIANTS[0];
  }, [currentVariantId, customVariants]);

  // --- Handlers ---
  const handleSearch = async () => {
    if (!inputValue.trim()) {
      return;
    }

    setLoading(true);
    const chars = inputValue.trim().split('').filter(c => c.trim());
    const isMultiChar = chars.length > 1;
    
    // If multi-char, we add the whole word as a "concept" search
    const searchItems = isMultiChar ? [inputValue, ...chars] : chars;
    
    // Create skeleton results
    const newResults: SearchResult[] = searchItems.map(item => ({
      id: Math.random().toString(36).substr(2, 9),
      char: item,
      query: item,
      explanation: '',
      variantId: currentVariantId,
      loading: true
    }));

    // Prepend new results to top
    setResults(prev => {
      const merged = [...newResults, ...prev];
      return merged.slice(0, MAX_RESULTS);
    });

    // Process in parallel (limit concurrency in a real app, but ok for demo)
    const promises = newResults.map(async (res) => {
      try {
        const data = await generateAssociation(res.query, getCurrentVariant(), filters, apiKey || undefined);
        
        setResults(prev => prev.map(r => {
          if (r.id === res.id) {
            return {
              ...r,
              ...data,
              loading: false
            };
          }
          return r;
        }));
      } catch (e) {
        setResults(prev => prev.map(r => {
          if (r.id === res.id) {
            return { ...r, loading: false, error: 'Retrieval failed', explanation: 'AI Connection Error' };
          }
          return r;
        }));
      }
    });

    await Promise.all(promises);
    setLoading(false);
    setInputValue('');
  };

  const handleDeleteResult = (id: string) => {
    setResults(prev => prev.filter(r => r.id !== id));
  };

  const handleToggleFavorite = (result: SearchResult) => {
     setResults(prev => prev.map(r => r.id === result.id ? { ...r, isFavorite: !r.isFavorite } : r));
  };

  // Persist results to localStorage
  React.useEffect(() => {
    try {
      window.localStorage.setItem(RESULTS_KEY, JSON.stringify(results));
    } catch (e) {
      // ignore localStorage errors
    }
  }, [results]);

  // Persist custom variants to localStorage
  React.useEffect(() => {
    try { window.localStorage.setItem('hieroglyph_custom_variants', JSON.stringify(customVariants)); } catch (e) {}
  }, [customVariants]);

  const handleEditVariant = (updated: VariantType) => {
    setCustomVariants(prev => prev.map(v => v.id === updated.id ? updated : v));
  };

  const handleClearResults = () => {
     setResults([]);
     try { window.localStorage.removeItem(RESULTS_KEY); } catch (e) {}
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'ink' ? 'green' : 'ink');
  };

  // --- Render ---
  return (
    <div className={`${theme === 'green' ? 'dark' : ''}`}>
      <div className="min-h-screen transition-colors duration-500 bg-ink-50 dark:bg-zinc-950 text-ink-900 dark:text-stone-100 flex flex-col">
        
        {/* Navbar */}
        <header className="sticky top-0 z-50 backdrop-blur-md bg-white/70 dark:bg-zinc-900/80 border-b border-stone-200 dark:border-zinc-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded border-2 flex items-center justify-center font-calligraphy text-xl ${theme === 'ink' ? 'border-ink-900 bg-ink-900 text-white' : 'border-jade-500 text-jade-500'}`}>
                壁
              </div>
              <h1 className="text-xl font-bold font-serif tracking-tight">壁画高手 <span className="text-xs font-normal text-stone-500 dark:text-stone-400">Mural Master</span></h1>
            </div>

            <div className="flex items-center gap-4">
              <button 
                onClick={toggleTheme}
                className="p-2 rounded-full hover:bg-stone-200 dark:hover:bg-zinc-800 transition-colors"
                title="Switch Theme"
              >
                {theme === 'ink' ? '🌙' : '☀️'}
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
          
          {/* Input Section */}
          <div className="max-w-3xl mx-auto mb-12 text-center">
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-8 text-ink-800 dark:text-stone-100">
               汉字联想 <span className="text-seal">×</span> 视觉检索
            </h2>
            
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-stone-200 to-stone-300 dark:from-jade-900 dark:to-zinc-800 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
              <div className="relative flex items-center bg-white dark:bg-zinc-900 rounded-lg shadow-xl p-2 border border-stone-100 dark:border-zinc-700">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="输入一个汉字或词语..."
                  className="flex-1 bg-transparent border-none px-4 py-3 text-lg md:text-xl placeholder-stone-400 dark:placeholder-zinc-600 focus:ring-0 outline-none dark:text-white font-serif"
                />
                <div className="flex items-center border-l border-stone-100 dark:border-zinc-800 pl-2">
                   <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`p-3 rounded-md transition-colors ${showFilters ? 'text-ink-600 bg-stone-100 dark:text-jade-400 dark:bg-zinc-800' : 'text-stone-400 hover:text-stone-600 dark:hover:text-stone-300'}`}
                   >
                     <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="21" x2="4" y2="14"></line><line x1="4" y1="10" x2="4" y2="3"></line><line x1="12" y1="21" x2="12" y2="12"></line><line x1="12" y1="8" x2="12" y2="3"></line><line x1="20" y1="21" x2="20" y2="16"></line><line x1="20" y1="12" x2="20" y2="3"></line><line x1="1" y1="14" x2="7" y2="14"></line><line x1="9" y1="8" x2="15" y2="8"></line><line x1="17" y1="16" x2="23" y2="16"></line></svg>
                   </button>
                   <button
                    onClick={handleSearch}
                    disabled={loading || !inputValue}
                    className="ml-2 px-6 py-3 bg-ink-900 hover:bg-ink-800 dark:bg-jade-700 dark:hover:bg-jade-600 text-white rounded-md font-medium transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                   >
                     {loading ? '检索中...' : '联想'}
                   </button>
                </div>
              </div>
            </div>
            <p className="mt-2 text-xs text-stone-400 dark:text-stone-500 text-right">
              AI 实时检索 | 自动分词 | 视觉联想
            </p>
          </div>

          {/* Controls */}
          <FilterPanel 
            isOpen={showFilters} 
            setIsOpen={setShowFilters}
            filters={filters} 
            onChange={setFilters}
            apiKey={apiKey}
            setApiKey={(k: string) => {
              try { window.localStorage.setItem('hieroglyph_api_key', k || ''); } catch (e) {}
              setApiKey(k);
            }}
          />
          
          <VariantManager 
            currentVariantId={currentVariantId}
            customVariants={customVariants}
            onSelect={setCurrentVariantId}
            onCreate={(v) => setCustomVariants([...customVariants, v])}
            onDelete={(id) => setCustomVariants(prev => prev.filter(v => v.id !== id))}
            onEdit={(v) => setCustomVariants(prev => prev.map(pv => pv.id === v.id ? v : pv))}
          />

          <div className="flex justify-end mb-6">
            <button
              onClick={handleClearResults}
              className="text-xs px-3 py-2 bg-stone-100 dark:bg-zinc-700 rounded-md hover:bg-stone-200 dark:hover:bg-zinc-600"
            >清空检索历史</button>
          </div>

          {/* Results Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {results.map((result) => (
              <div key={result.id} className="h-[540px] animate-fade-in-up">
                <ResultCard 
                  result={result} 
                  onToggleFavorite={handleToggleFavorite}
                  onRemove={handleDeleteResult}
                />
              </div>
            ))}
            
            {results.length === 0 && !loading && (
              <div className="col-span-full py-20 text-center opacity-30 select-none pointer-events-none">
                 <div className="text-8xl mb-4 font-calligraphy text-stone-300 dark:text-zinc-800">空</div>
                 <p className="text-stone-400 dark:text-zinc-600 font-serif">输入文字，开始探索汉字的视觉宇宙</p>
              </div>
            )}
          </div>

        </main>
        
        {/* Footer */}
        <footer className="py-6 text-center text-xs text-stone-400 dark:text-zinc-600 border-t border-stone-100 dark:border-zinc-900">
           <p>© 2025 HypnosPD. Powered by Gemini.</p>
        </footer>
      </div>
    </div>
  );
};

export default App;