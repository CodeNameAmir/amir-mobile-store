import React from 'react';
import { useStore } from '../context/StoreContext';

export const RouteTransitionBar: React.FC = () => {
  const { navigating } = useStore();
  if (!navigating) return null;

  return (
    <div
      aria-hidden="true"
      data-testid="route-transition-bar"
      className="fixed top-0 left-0 right-0 z-[70] h-[3px] bg-[#dbe7ff] overflow-hidden pointer-events-none no-print"
    >
      <div className="h-full w-2/5 bg-gradient-to-r from-[#004ac6] via-[#2563eb] to-[#b54e00] route-progress-indeterminate" />
    </div>
  );
};
