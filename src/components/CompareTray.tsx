import React from 'react';
import { ArrowLeft, Scale, Trash2, X } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { toPersianDigits } from '../utils/storeLogic';
import { SmartImage } from './SmartImage';

export const CompareTray: React.FC = () => {
  const { products, compareIds, toggleCompare, clearCompare, buildHref, handleLinkClick, route } = useStore();

  if (compareIds.length === 0 || route.page === 'compare') {
    return null;
  }

  const selected = products.filter((p) => compareIds.includes(p.id));
  if (selected.length === 0) return null;

  return (
    <div
      data-testid="compare-tray"
      className="fixed bottom-4 right-4 left-4 md:left-auto md:right-6 md:max-w-xl z-40 no-print"
    >
      <div className="bg-[#0b1c30]/95 backdrop-blur-md text-white rounded-2xl border border-[#2563eb]/40 p-3.5 shadow-[0_18px_40px_rgba(11,28,48,0.28)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-[#004ac6] text-white flex items-center justify-center shrink-0">
            <Scale className="w-4 h-4" />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            {selected.map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-1.5 bg-white/10 rounded-xl pl-2 pr-1 py-1 shrink-0"
              >
                <div className="w-7 h-7 rounded-lg overflow-hidden bg-white shrink-0">
                  <SmartImage src={p.image} alt={p.nameFa} className="w-full h-full object-cover" />
                </div>
                <span className="text-[11px] font-bold max-w-[95px] truncate">{p.nameFa}</span>
                <button
                  type="button"
                  onClick={() => toggleCompare(p.id)}
                  aria-label={`حذف ${p.nameFa} از مقایسه`}
                  className="text-white/70 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 justify-end">
          <button
            type="button"
            onClick={clearCompare}
            aria-label="پاک کردن لیست مقایسه"
            className="h-9 w-9 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 inline-flex items-center justify-center transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <a
            href={buildHref('/compare')}
            onClick={(e) => handleLinkClick(e, '/compare')}
            data-testid="open-compare-page-btn"
            className="h-9 px-4 rounded-xl bg-[#2563eb] hover:bg-[#004ac6] text-white text-xs font-extrabold inline-flex items-center gap-1.5 transition-colors whitespace-nowrap"
          >
            <span>مقایسه ({toPersianDigits(selected.length)} از ۳)</span>
            <ArrowLeft className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
};
