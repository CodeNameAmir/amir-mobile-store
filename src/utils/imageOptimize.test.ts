import test from 'node:test';
import assert from 'node:assert/strict';
import { buildResponsiveImageSrcSet, optimizeImageUrl } from './imageOptimize';

test('optimizeImageUrl rewrites Digikala CDN resize params to WebP and target width', () => {
  const input =
    'https://dkstatics-public.digikala.com/digikala-products/sample.jpg?x-oss-process=image/resize,m_lfit,h_800,w_800/quality,q_90';
  const out = optimizeImageUrl(input, { width: 480, quality: 80 });
  assert.match(out, /h_480,w_480\/format,webp\/quality,q_80/);
});

test('optimizeImageUrl adds WebP resize params to bare Digikala product URLs', () => {
  const input = 'https://dkstatics-public.digikala.com/digikala-products/sample.jpg';
  const out = optimizeImageUrl(input, { width: 800, quality: 85 });
  assert.match(out, /h_800,w_800\/format,webp\/quality,q_85/);
});

test('optimizeImageUrl leaves local assets and data URLs untouched', () => {
  assert.equal(optimizeImageUrl('/assets/hero-123.webp'), '/assets/hero-123.webp');
  assert.equal(optimizeImageUrl('data:image/png;base64,AAA'), 'data:image/png;base64,AAA');
  assert.equal(optimizeImageUrl(''), '');
});

test('buildResponsiveImageSrcSet produces sorted WebP width descriptors for Digikala CDN URLs', () => {
  const input = 'https://dkstatics-public.digikala.com/digikala-products/sample.jpg';
  const srcset = buildResponsiveImageSrcSet(input, 480, 80);
  assert.ok(srcset);
  assert.doesNotMatch(srcset, /128w/);
  assert.match(srcset, /w_160\/format,webp\/quality,q_80 160w/);
  assert.match(srcset, /w_360\/format,webp\/quality,q_80 360w/);
  assert.match(srcset, /w_480\/format,webp\/quality,q_80 480w/);
  assert.doesNotMatch(srcset, /640w/);
  assert.match(optimizeImageUrl(input, { width: 120 }), /h_160,w_160/);
  assert.equal(buildResponsiveImageSrcSet(input, 128), undefined);
  assert.equal(buildResponsiveImageSrcSet('/assets/hero.webp', 800), undefined);
});
