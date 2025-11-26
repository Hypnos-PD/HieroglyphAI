import React, { useState } from 'react';
import { PRESET_VARIANTS } from '../constants';
import { Variant as VariantType } from '../types';

interface VariantManagerProps {
  currentVariantId: string;
  customVariants: VariantType[];
  onSelect: (id: string) => void;
  onCreate: (v: VariantType) => void;
  onDelete: (id: string) => void;
  onEdit?: (v: VariantType) => void;
}

const VariantManager: React.FC<VariantManagerProps> = ({ currentVariantId, customVariants, onSelect, onCreate, onDelete, onEdit }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newVariant, setNewVariant] = useState({ name: '', description: '', keywords: '' });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingVariant, setEditingVariant] = useState({ name: '', description: '', keywords: '' });
  const allVariants = [...PRESET_VARIANTS, ...customVariants];

  const handleCreate = () => {
    if (!newVariant.name || !newVariant.keywords) return;
    const variant: VariantType = {
      id: `custom-${Date.now()}`,
      name: newVariant.name,
      description: newVariant.description,
      keywords: newVariant.keywords.split(/[,，\s]+/).filter(k => k.trim().length > 0),
      isCustom: true,
    };
    onCreate(variant);
    setIsCreating(false);
    setNewVariant({ name: '', description: '', keywords: '' });
    onSelect(variant.id);
  };

  return (
    <div className="w-full mb-8">
       <div className="flex flex-wrap gap-3 items-center justify-center md:justify-start">
         <span className="text-sm text-stone-500 font-serif mr-2">联想变体:</span>
         {allVariants.map(v => (
           <button
             key={v.id}
             onClick={() => onSelect(v.id)}
             className={`
               group relative px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 border
               ${currentVariantId === v.id 
                 ? 'bg-ink-800 text-stone-50 border-ink-800 dark:bg-jade-700 dark:border-jade-700 shadow-md' 
                 : 'bg-white text-stone-600 border-stone-200 hover:border-ink-400 dark:bg-zinc-800 dark:text-stone-400 dark:border-zinc-700 dark:hover:border-jade-500'}
             `}
           >
             {v.name}
             {v.isCustom && (
                <>
                <span 
                  onClick={(e) => { e.stopPropagation(); onDelete(v.id); setEditingId(prev => prev === v.id ? null : prev); }}
                  className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 cursor-pointer"
                >
                  ×
                </span>
                <span
                  onClick={(e) => { e.stopPropagation(); setEditingId(v.id); setEditingVariant({ name: v.name, description: v.description || '', keywords: (v.keywords || []).join(', ') }); }}
                  className="absolute -top-1 -right-10 w-4 h-4 bg-stone-200 dark:bg-zinc-700 text-stone-700 dark:text-stone-200 rounded-full flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 cursor-pointer"
                >
                  ✎
                </span>
                </>
             )}
           </button>
         ))}
         
         {/* Add Button */}
         <button 
           onClick={() => setIsCreating(!isCreating)}
           className="px-3 py-2 rounded-full border border-dashed border-stone-300 text-stone-400 hover:border-ink-500 hover:text-ink-500 dark:border-zinc-600 dark:hover:border-jade-500 dark:hover:text-jade-400 transition-colors"
         >
           + 自定义
         </button>
       </div>

       {/* Create Modal (Inline) */}
      {isCreating && (
         <div className="mt-4 p-4 bg-stone-100 dark:bg-zinc-900 rounded-lg border border-stone-200 dark:border-zinc-700 animate-fade-in">
            <h4 className="text-sm font-bold text-ink-800 dark:text-stone-200 mb-3">创建新变体</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input 
                type="text" 
                placeholder="名称 (如: 复古游戏)"
                value={newVariant.name}
                onChange={(e) => setNewVariant({...newVariant, name: e.target.value})}
                className="p-2 rounded border border-stone-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white text-sm"
              />
              <input 
                type="text" 
                placeholder="关键词 (逗号分隔: 红白机, 像素...)"
                value={newVariant.keywords}
                onChange={(e) => setNewVariant({...newVariant, keywords: e.target.value})}
                className="p-2 rounded border border-stone-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white text-sm md:col-span-2"
              />
              <input 
                type="text" 
                placeholder="描述 (可选)"
                value={newVariant.description}
                onChange={(e) => setNewVariant({...newVariant, description: e.target.value})}
                className="p-2 rounded border border-stone-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white text-sm md:col-span-3"
              />
            </div>
            <div className="flex justify-end gap-2 mt-3">
              <button onClick={() => setIsCreating(false)} className="px-3 py-1 text-sm text-stone-500 hover:text-stone-700">取消</button>
              <button onClick={handleCreate} className="px-4 py-1 text-sm bg-ink-800 text-white rounded hover:bg-ink-700 dark:bg-jade-700 dark:hover:bg-jade-600">创建</button>
            </div>
         </div>
       )}

      {/* Edit Modal (Inline) */}
      {editingId && (
        <div className="mt-4 p-4 bg-stone-100 dark:bg-zinc-900 rounded-lg border border-stone-200 dark:border-zinc-700 animate-fade-in">
           <h4 className="text-sm font-bold text-ink-800 dark:text-stone-200 mb-3">编辑变体</h4>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
             <input
               type="text"
               placeholder="名称 (如: 复古游戏)"
               value={editingVariant.name}
               onChange={(e) => setEditingVariant({...editingVariant, name: e.target.value})}
               className="p-2 rounded border border-stone-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white text-sm"
             />
             <input
               type="text"
               placeholder="关键词 (逗号分隔)"
               value={editingVariant.keywords}
               onChange={(e) => setEditingVariant({...editingVariant, keywords: e.target.value})}
               className="p-2 rounded border border-stone-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white text-sm md:col-span-2"
             />
             <input
               type="text"
               placeholder="描述 (可选)"
               value={editingVariant.description}
               onChange={(e) => setEditingVariant({...editingVariant, description: e.target.value})}
               className="p-2 rounded border border-stone-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white text-sm md:col-span-3"
             />
           </div>
           <div className="flex justify-end gap-2 mt-3">
             <button onClick={() => setEditingId(null)} className="px-3 py-1 text-sm text-stone-500 hover:text-stone-700">取消</button>
             <button onClick={() => {
               if (!editingId) return;
               const updated: VariantType = {
                 id: editingId,
                 name: editingVariant.name,
                 description: editingVariant.description,
                 keywords: editingVariant.keywords.split(/[,，\s]+/).filter(k => k.trim().length > 0),
                 isCustom: true,
               };
               onEdit && onEdit(updated);
               setEditingId(null);
             }} className="px-4 py-1 text-sm bg-ink-800 text-white rounded hover:bg-ink-700 dark:bg-jade-700 dark:hover:bg-jade-600">保存</button>
           </div>
        </div>
      )}
    </div>
  );
};

export default VariantManager;