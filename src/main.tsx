import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import {handleChunkLoadFailureInBrowser} from './utils/lazyWithRetry';

if (typeof window !== 'undefined') {
  // Clean up temporary cache-busting param added after stale-chunk recovery
  try {
    const currentUrl = new URL(window.location.href);
    if (currentUrl.searchParams.has('_v')) {
      currentUrl.searchParams.delete('_v');
      window.history.replaceState(
        window.history.state,
        '',
        `${currentUrl.pathname}${currentUrl.search}${currentUrl.hash}`
      );
    }
  } catch {
    // Ignore history errors
  }

  window.addEventListener('vite:preloadError', () => {
    handleChunkLoadFailureInBrowser();
  });
}

createRoot(document.getElementById('root')!).render(<App />);

if (import.meta.env.PROD && typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js', {scope: '/', updateViaCache: 'none'})
      .then((reg) => reg.update().catch(() => undefined))
      .catch(() => undefined);
  });
}
