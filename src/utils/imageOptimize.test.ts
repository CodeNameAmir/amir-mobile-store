import test from 'node:test';
import assert from 'node:assert/strict';
import { optimizeImageUrl } from './imageOptimize';

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
