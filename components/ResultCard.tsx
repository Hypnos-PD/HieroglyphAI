import React, { useState } from 'react';
import { SearchResult } from '../types';

interface ResultCardProps {
  result: SearchResult;
  onToggleFavorite: (result: SearchResult) => void;
  onRemove: (id: string) => void;
}

const ResultCard: React.FC<ResultCardProps> = ({ result, onToggleFavorite, onRemove }) => {
  const [imgError, setImgError] = useState(false);

  // Reset error state if imageUrl changes (e.g. re-search)
  React.useEffect(() => {
    setImgError(false);
  }, [result.imageUrl]);

  const handleImageError = () => {
    setImgError(true);
  };

  const hasValidImage = result.imageUrl && result.imageUrl.trim() !== '' && !imgError;

  // 判断 sourceUrl 是否是一个具体的网页（而不是 Google 搜索结果页）
  // 简单的判断逻辑：不包含 google.com/search 且不为空
  const hasSpecificSource = result.sourceUrl && !result.sourceUrl.includes('google.com/search');

  return (
    <div className="relative group bg-white dark:bg-zinc-800 rounded-xl shadow-md hover:shadow-2xl transition-all duration-500 overflow-hidden border border-stone-200 dark:border-zinc-700 flex flex-col h-full animate-fade-in-up">
      
      {/* Remove Button */}
      <button 
        onClick={() => onRemove(result.id)}
        className="absolute top-2 right-2 z-30 p-2 text-stone-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 dark:bg-black/40 rounded-full backdrop-blur-sm"
        title="移除"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
      </button>

      {/* Visual Area: make this taller so the fallback search buttons are visible and images are larger */}
      <div className="relative w-full h-2/3 bg-stone-100 dark:bg-zinc-900 overflow-hidden group/image">
        {result.loading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-stone-400">
            <div className="animate-spin mb-4 rounded-full h-10 w-10 border-b-2 border-ink-600 dark:border-jade-400"></div>
            <span className="text-sm font-serif animate-pulse tracking-widest">墨迹晕染中...</span>
          </div>
        ) : hasValidImage ? (
          <>
            {/* Character Overlay (Small) - Only show when image exists */}
            <div className="absolute top-3 left-3 z-10 pointer-events-none opacity-0 group-hover/image:opacity-100 transition-opacity duration-500">
                <div className="w-10 h-10 bg-white/90 dark:bg-black/70 backdrop-blur-md rounded-lg flex items-center justify-center shadow-lg border border-stone-100 dark:border-zinc-600">
                  <span className="font-serif text-xl text-ink-900 dark:text-stone-100 font-bold">{result.char}</span>
                </div>
            </div>

            <img
                src={result.imageUrl}
                alt={result.query}
                onError={handleImageError}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            
            {/* Source Link Overlay */}
            {result.sourceTitle && (
                <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover/image:opacity-100 transition-opacity duration-300 flex justify-end">
                    <a href={result.sourceUrl} target="_blank" rel="noreferrer" className="text-[10px] text-white/90 hover:text-white flex items-center gap-1 bg-black/40 px-2 py-1 rounded-full backdrop-blur-sm hover:bg-black/60 transition-colors">
                        <span>🔗 {result.sourceTitle.slice(0, 15)}...</span>
                    </a>
                </div>
            )}
          </>
        ) : (
          /* Fallback / Text Mode UI - "The Calligraphy Card" */
          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-stone-50 dark:bg-zinc-800 relative overflow-hidden group/fallback">
             {/* Decorative Background Char */}
             <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] dark:opacity-[0.05] select-none pointer-events-none transition-opacity duration-700 group-hover/fallback:opacity-[0.08] dark:group-hover/fallback:opacity-[0.1]">
                <span className="font-calligraphy text-[200px] text-ink-900 dark:text-stone-100 transform -rotate-12">{result.char}</span>
             </div>
             
             {/* Main Char */}
             <div className="z-10 mb-2 transform group-hover/fallback:scale-110 transition-transform duration-500">
                <span className="font-serif text-7xl text-ink-800 dark:text-jade-100 drop-shadow-sm">{result.char}</span>
             </div>

             <div className="z-10 w-full px-4 flex flex-col items-center gap-2">
                 <p className="text-[10px] font-serif text-stone-400 uppercase tracking-widest border-b border-stone-200 dark:border-zinc-700 pb-1 mb-1">
                    无法直接显示预览
                 </p>

                 {/* High Priority: Jump to specific source page if available */}
                 {hasSpecificSource && (
                   <a 
                     href={result.sourceUrl}
                     target="_blank"
                     rel="noopener noreferrer"
                     className="w-full max-w-[180px] flex items-center justify-center gap-2 px-3 py-2 bg-ink-800 hover:bg-ink-700 dark:bg-jade-700 dark:hover:bg-jade-600 text-white text-xs rounded shadow-md transition-all hover:-translate-y-0.5 mb-1"
                   >
                     <span>🔗 跳转来源网页</span>
                   </a>
                 )}
                 
                 {/* Secondary: Search Engines */}
                 <div className="flex gap-2 w-full justify-center">
                    <a 
                    href={`https://www.google.com/search?tbm=isch&q=${encodeURIComponent(result.fallbackQuery || result.query)}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex-1 max-w-[90px] flex items-center justify-center gap-1 px-2 py-1.5 bg-white dark:bg-zinc-700 border border-stone-200 dark:border-zinc-600 text-ink-800 dark:text-stone-200 text-[10px] rounded shadow-sm hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700 transition-all hover:-translate-y-0.5"
                    title="Google 图片"
                    >
                        <span className="text-blue-500 font-bold">G</span> 搜图
                    </a>
                    <a 
                    href={`https://www.bing.com/images/search?q=${encodeURIComponent(result.fallbackQuery || result.query)}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex-1 max-w-[90px] flex items-center justify-center gap-1 px-2 py-1.5 bg-white dark:bg-zinc-700 border border-stone-200 dark:border-zinc-600 text-ink-800 dark:text-stone-200 text-[10px] rounded shadow-sm hover:shadow-md hover:border-teal-300 dark:hover:border-teal-700 transition-all hover:-translate-y-0.5"
                    title="Bing 图片"
                    >
                        <span className="text-teal-600 font-bold">B</span> 搜图
                    </a>
                 </div>
             </div>
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="p-5 flex-1 min-h-0 overflow-y-auto flex flex-col justify-between bg-white dark:bg-zinc-800 relative z-20">
        <div>
          <div className="mb-2">
            <span className="inline-block px-2 py-0.5 rounded text-[10px] bg-stone-100 dark:bg-zinc-700 text-stone-500 dark:text-zinc-400 border border-stone-200 dark:border-zinc-600">
                {result.variantId === 'daily' ? '日常' : '自定义'}
            </span>
          </div>
          <p className="text-base text-stone-700 dark:text-stone-300 leading-relaxed font-serif text-justify">
            {result.loading ? "正在构思联想..." : result.explanation || "暂无解释"}
          </p>
        </div>

        <div className="mt-4 pt-4 border-t border-stone-100 dark:border-zinc-700 flex justify-between items-center">
            <div className="flex gap-4">
               <button className="text-stone-400 hover:text-jade-600 dark:hover:text-jade-400 transition-colors text-xs flex items-center gap-1 group/like">
                  <span className="group-hover/like:scale-110 transition-transform">👍</span>
               </button>
               <button className="text-stone-400 hover:text-seal transition-colors text-xs flex items-center gap-1 group/dislike">
                  <span className="group-hover/dislike:scale-110 transition-transform">👎</span>
               </button>
            </div>
            <button 
              onClick={() => onToggleFavorite(result)}
              className={`transition-colors p-2 rounded-full hover:bg-stone-100 dark:hover:bg-zinc-700 ${result.isFavorite ? 'text-seal' : 'text-stone-300 hover:text-seal'}`}
              title="收藏"
            >
               <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill={result.isFavorite ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
            </button>
        </div>
      </div>
    </div>
  );
};

export default ResultCard;