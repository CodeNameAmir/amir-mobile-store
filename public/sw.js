const CACHE_VERSION = 'amir-mobile-store-v3';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const CORE_SHELL_ASSETS = [
  '/manifest.webmanifest',
  '/favicon.svg',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/apple-touch-icon.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(CORE_SHELL_ASSETS).catch(() => undefined))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== STATIC_CACHE)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

function isCacheableIconOrManifest(url) {
  const path = url.pathname;
  return (
    path.startsWith('/icons/') ||
    path === '/manifest.webmanifest' ||
    path === '/favicon.svg' ||
    path === '/apple-touch-icon.png'
  );
}

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) {
    return;
  }

  // Never intercept API calls, crawler metadata files, or content-hashed Vite bundle assets (/assets/*)
  if (
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/assets/') ||
    url.pathname === '/robots.txt' ||
    url.pathname === '/sitemap.xml' ||
    url.pathname === '/llms.txt'
  ) {
    return;
  }

  // Navigation requests: always revalidate HTML shell from network (`no-cache`)
  // to avoid GitHub Pages / CDN max-age=600 serving an outdated index.html
  // that references deleted lazy JS chunks after a deployment.
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req, { cache: 'no-cache' })
        .then((res) => {
          const contentType = res.headers.get('content-type') || '';
          if (res && res.ok && url.pathname === '/' && contentType.includes('text/html')) {
            const copy = res.clone();
            caches.open(STATIC_CACHE).then((cache) => cache.put('/', copy)).catch(() => undefined);
          }
          return res;
        })
        .catch(async () => {
          const cachedShell = await caches.match('/');
          if (cachedShell) return cachedShell;
          return new Response(
            '<!doctype html><html lang="fa" dir="rtl"><head><meta charset="UTF-8"><title>آفلاین | فروشگاه موبایل امیر</title></head><body style="font-family:sans-serif;background:#F7F8FA;color:#11161E;display:flex;align-items:center;justify-content:center;min-height:100vh;padding:24px;text-align:center;"><div><h1>اتصال اینترنت برقرار نیست</h1><p>لطفاً اتصال اینترنت خود را بررسی کرده و صفحه را مجدداً بارگذاری کنید.</p></div></body></html>',
            {
              status: 503,
              headers: { 'Content-Type': 'text/html; charset=utf-8' },
            }
          );
        })
    );
    return;
  }

  // Brand icons and manifest only: cache-first with safe network fallback (never resolves to undefined)
  if (isCacheableIconOrManifest(url)) {
    event.respondWith(
      caches.match(req).then((cached) => {
        if (cached) return cached;
        return fetch(req).then((res) => {
          if (res && res.ok) {
            const copy = res.clone();
            caches.open(STATIC_CACHE).then((cache) => cache.put(req, copy)).catch(() => undefined);
          }
          return res;
        });
      })
    );
  }
});
