import React, { useState } from 'react';
import { Smartphone } from 'lucide-react';

interface SmartImageProps {
  src: string;
  alt: string;
  className?: string;
  containerClassName?: string;
  loading?: 'lazy' | 'eager';
}

export const SmartImage: React.FC<SmartImageProps> = ({
  src,
  alt,
  className = 'w-full h-full object-cover',
  containerClassName = '',
  loading = 'lazy',
}) => {
  const [failed, setFailed] = useState(false);

  if (failed || !src) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-[#eff4ff] text-[#434655] ${containerClassName || className}`}
        aria-label={alt}
      >
        <Smartphone className="w-10 h-10 text-[#004ac6]/40 mb-2" />
        <span className="text-[11px] font-medium text-[#434655] px-2 text-center line-clamp-1">
          {alt}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading={loading}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={className}
    />
  );
};
