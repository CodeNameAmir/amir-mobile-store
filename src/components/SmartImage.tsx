import React, { useEffect, useMemo, useState } from 'react';
import { Smartphone } from 'lucide-react';
import { buildResponsiveImageSrcSet, optimizeImageUrl } from '../utils/imageOptimize';

interface SmartImageProps {
  src: string;
  alt: string;
  className?: string;
  containerClassName?: string;
  loading?: 'lazy' | 'eager';
  fetchPriority?: 'high' | 'low' | 'auto';
  optimizeWidth?: number;
  optimizeQuality?: number;
  sizes?: string;
  width?: number;
  height?: number;
}

export const SmartImage: React.FC<SmartImageProps> = ({
  src,
  alt,
  className = 'w-full h-full object-cover',
  containerClassName = '',
  loading = 'lazy',
  fetchPriority,
  optimizeWidth = 480,
  optimizeQuality = 80,
  sizes,
  width,
  height,
}) => {
  const [failed, setFailed] = useState(false);

  const optimizedSrc = useMemo(
    () => optimizeImageUrl(src, { width: optimizeWidth, quality: optimizeQuality }),
    [src, optimizeWidth, optimizeQuality]
  );

  const responsiveSrcSet = useMemo(
    () => buildResponsiveImageSrcSet(src, optimizeWidth, optimizeQuality),
    [src, optimizeWidth, optimizeQuality]
  );

  useEffect(() => {
    setFailed(false);
  }, [optimizedSrc]);

  if (failed || !optimizedSrc) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-[#F3F5F8] text-[#4A5464] ${containerClassName || className}`}
        aria-label={alt}
      >
        <Smartphone className="w-10 h-10 text-[#576071] mb-2" strokeWidth={1.5} />
        <span className="text-[11px] font-medium text-[#4A5464] px-2 text-center line-clamp-1">
          {alt}
        </span>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden bg-[#F3F5F8] ${containerClassName || 'w-full h-full'}`}>
      <img
        src={optimizedSrc}
        srcSet={responsiveSrcSet}
        sizes={responsiveSrcSet ? sizes || `${optimizeWidth}px` : undefined}
        alt={alt}
        width={width}
        height={height}
        loading={loading}
        decoding={fetchPriority === 'high' ? 'sync' : 'async'}
        fetchPriority={fetchPriority}
        referrerPolicy="no-referrer"
        onError={() => setFailed(true)}
        className={className}
      />
    </div>
  );
};
