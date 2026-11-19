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
      className="fixed bottom-5 right-5 z-40 h-11 px-4 rounded-2xl bg-[#0b1c30]/90 hover:bg-[#004ac6] text-white text-xs font-bold shadow-[0_12px_28px_rgba(11,28,48,0.22)] backdrop-blur-md inline-flex items-center gap-2 transition-all duration-200 hover:-translate-y-0.5 no-print"
    >
      <ArrowUp className="w-4 h-4" />
      <span className="hidden sm:inline">بازگشت به بالا</span>
    </button>
  );
};
