const CACHE_VERSION = 'amir-mobile-store-v1';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const CORE_SHELL_ASSETS = [
  '/',
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

function isStaticAssetRequest(url) {
  const path = url.pathname;
  return (
    path.startsWith('/assets/') ||
    path.startsWith('/icons/') ||
    /\.(?:js|css|woff2?|ttf|png|jpe?g|webp|svg|ico|webmanifest)$/i.test(path)
  );
}

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) {
    return;
  }

  // Never intercept or cache API calls
  if (url.pathname.startsWith('/api/')) {
    return;
  }

  // Navigation requests: network-first with cached SPA shell fallback
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (res && res.ok) {
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

  // Static assets: stale-while-revalidate
  if (isStaticAssetRequest(url)) {
    event.respondWith(
      caches.match(req).then((cached) => {
        const networkFetch = fetch(req)
          .then((res) => {
            if (res && res.ok) {
              const copy = res.clone();
              caches.open(STATIC_CACHE).then((cache) => cache.put(req, copy)).catch(() => undefined);
            }
            return res;
          })
          .catch(() => undefined);

        return cached || networkFetch;
      })
    );
  }
});
