import React, { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';

export const BackToTopButton: React.FC = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > 360);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!visible) return null;

  const scrollToTop = () => {
    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
  };

  return (
    <button
      type="button"
      onClick={scrollToTop}
      data-testid="back-to-top-btn"
      aria-label="بازگشت به بالای صفحه"
      title="بازگشت به بالای صفحه"
      className="fixed bottom-5 right-5 z-40 h-10 px-3.5 rounded-lg bg-[#13171F] hover:bg-[#1453D6] text-white border border-white/10 text-xs font-medium shadow-md inline-flex items-center gap-2 transition-colors no-print"
    >
      <ArrowUp className="w-4 h-4" strokeWidth={1.5} />
      <span className="hidden sm:inline">بازگشت به بالا</span>
    </button>
  );
};
