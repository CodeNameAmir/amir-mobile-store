export interface OptimizeImageOptions {
  width?: number;
  quality?: number;
  format?: 'webp' | 'auto';
}

/**
 * Optimizes external CDN image URLs (such as Digikala OSS CDN) for the actual
 * rendered container width and WebP format, drastically reducing image payload.
 */
export function optimizeImageUrl(src: string, opts: OptimizeImageOptions = {}): string {
  const trimmed = String(src || '').trim();
  if (!trimmed || trimmed.startsWith('data:') || trimmed.startsWith('blob:')) {
    return trimmed;
  }

  const width = Math.max(160, Math.min(1600, Math.round(opts.width ?? 480)));
  const quality = Math.max(40, Math.min(95, Math.round(opts.quality ?? 80)));
  const format = opts.format ?? 'webp';

  try {
    if (trimmed.includes('dkstatics-public.digikala.com')) {
      const parsed = new URL(trimmed);
      const oss = parsed.searchParams.get('x-oss-process');
      const formatToken = format === 'webp' ? '/format,webp' : '';
      if (!oss || oss.startsWith('image/resize')) {
        const nextProcess = `image/resize,m_lfit,h_${width},w_${width}${formatToken}/quality,q_${quality}`;
        parsed.searchParams.delete('x-oss-process');
        const remainingQuery = parsed.searchParams.toString();
        const base = `${parsed.origin}${parsed.pathname}`;
        const queryPrefix = remainingQuery ? `?${remainingQuery}&` : '?';
        return `${base}${queryPrefix}x-oss-process=${nextProcess}${parsed.hash}`;
      }
    }
  } catch {
    // Return original URL if URL parsing fails
  }

  return trimmed;
}

const RESPONSIVE_WIDTH_STEPS = [160, 200, 240, 360, 480, 640, 800, 960] as const;

export function buildResponsiveImageSrcSet(
  src: string,
  maxWidth = 480,
  quality = 80
): string | undefined {
  const trimmed = String(src || '').trim();
  if (!trimmed || !trimmed.includes('dkstatics-public.digikala.com')) {
    return undefined;
  }

  const clampedMax = Math.max(160, Math.min(1600, Math.round(maxWidth)));
  const widths = Array.from(
    new Set([
      ...RESPONSIVE_WIDTH_STEPS.filter((w) => w < clampedMax),
      clampedMax,
    ])
  ).sort((a, b) => a - b);

  if (widths.length <= 1) {
    return undefined;
  }

  const entries = widths.map(
    (w) => `${optimizeImageUrl(trimmed, { width: w, quality })} ${w}w`
  );
  return entries.join(', ');
}
