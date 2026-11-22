import React from 'react';
import { useStore } from '../context/StoreContext';

export const RouteTransitionBar: React.FC = () => {
  const { navigating } = useStore();
  if (!navigating) return null;

  return (
    <div
      aria-hidden="true"
      data-testid="route-transition-bar"
      className="fixed top-0 left-0 right-0 z-[70] h-[2px] bg-[#E4E8EE] overflow-hidden pointer-events-none no-print"
    >
      <div className="h-full w-2/5 bg-[#1453D6] route-progress-indeterminate" />
    </div>
  );
};
