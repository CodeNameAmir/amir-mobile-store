import React, { useEffect, useState } from 'react';
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
  loading = 'eager',
}) => {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  if (failed || !src) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-[#F3F5F8] text-[#4A5464] ${containerClassName || className}`}
        aria-label={alt}
      >
        <Smartphone className="w-10 h-10 text-[#6E7889] mb-2" strokeWidth={1.5} />
        <span className="text-[11px] font-medium text-[#4A5464] px-2 text-center line-clamp-1">
          {alt}
        </span>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden bg-[#F3F5F8] ${containerClassName || 'w-full h-full'}`}>
      <img
        src={src}
        alt={alt}
        loading={loading}
        decoding="async"
        referrerPolicy="no-referrer"
        onError={() => setFailed(true)}
        className={className}
      />
    </div>
  );
};
