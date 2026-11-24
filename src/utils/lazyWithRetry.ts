import React from 'react';

export const CHUNK_RELOAD_STORAGE_KEY = 'amir_chunk_reload_at_v1';
export const CHUNK_RELOAD_COOLDOWN_MS = 15_000;

const CHUNK_ERROR_PATTERNS = [
  /failed to fetch dynamically imported module/i,
  /importing a module script failed/i,
  /error loading dynamically imported module/i,
  /loading chunk [\w-]+ failed/i,
  /loading css chunk [\w-]+ failed/i,
  /chunkloaderror/i,
  /unable to preload css/i,
  /dynamically imported module/i,
];

export function isChunkLoadError(error: unknown): boolean {
  if (!error) return false;
  const name =
    typeof error === 'object' && error !== null && 'name' in error
      ? String((error as { name?: unknown }).name || '')
      : '';
  const message =
    typeof error === 'string'
      ? error
      : typeof error === 'object' && error !== null && 'message' in error
      ? String((error as { message?: unknown }).message || '')
      : String(error);

  const combined = `${name} ${message}`.trim();
  return CHUNK_ERROR_PATTERNS.some((pattern) => pattern.test(combined));
}

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export function canAttemptChunkReload(
  storage: StorageLike | null | undefined,
  now = Date.now(),
  cooldownMs = CHUNK_RELOAD_COOLDOWN_MS
): boolean {
  if (!storage) return true;
  try {
    const raw = storage.getItem(CHUNK_RELOAD_STORAGE_KEY);
    if (!raw) return true;
    const lastAttempt = Number(raw);
    if (!Number.isFinite(lastAttempt)) return true;
    return now - lastAttempt > cooldownMs;
  } catch {
    return true;
  }
}

export function markChunkReloadAttempt(
  storage: StorageLike | null | undefined,
  now = Date.now()
): void {
  if (!storage) return;
  try {
    storage.setItem(CHUNK_RELOAD_STORAGE_KEY, String(now));
  } catch {
    // Ignore storage quota/privacy errors
  }
}

export function clearChunkReloadAttempt(storage: StorageLike | null | undefined): void {
  if (!storage) return;
  try {
    storage.removeItem(CHUNK_RELOAD_STORAGE_KEY);
  } catch {
    // Ignore storage errors
  }
}

export async function purgeBrowserCachesAndUpdateSW(): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    if ('caches' in window) {
      const keys = await window.caches.keys();
      await Promise.all(keys.map((key) => window.caches.delete(key)));
    }
  } catch {
    // Ignore Cache Storage API errors
  }
  try {
    if ('serviceWorker' in navigator) {
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map((reg) => reg.update().catch(() => undefined)));
    }
  } catch {
    // Ignore SW errors
  }
}

export function triggerCacheBustingReload(targetPath?: string): void {
  if (typeof window === 'undefined') return;
  try {
    const url = new URL(targetPath || window.location.href, window.location.origin);
    url.searchParams.set('_v', String(Date.now()));
    window.location.replace(url.toString());
  } catch {
    window.location.reload();
  }
}

export function handleChunkLoadFailureInBrowser(): boolean {
  if (typeof window === 'undefined') return false;
  const storage = window.sessionStorage;
  if (!canAttemptChunkReload(storage)) {
    return false;
  }
  markChunkReloadAttempt(storage);
  void purgeBrowserCachesAndUpdateSW().finally(() => {
    triggerCacheBustingReload();
  });
  return true;
}

export interface LazyRetryOptions {
  retryDelayMs?: number;
  maxRetries?: number;
  storage?: StorageLike | null;
  now?: () => number;
  onChunkErrorReload?: () => void;
}

export async function lazyImportWithRetry<T>(
  importer: () => Promise<T>,
  options: LazyRetryOptions = {}
): Promise<T> {
  const maxRetries = options.maxRetries ?? 1;
  const retryDelayMs = options.retryDelayMs ?? 300;
  const storage =
    options.storage !== undefined
      ? options.storage
      : typeof window !== 'undefined'
      ? window.sessionStorage
      : null;
  const nowFn = options.now ?? (() => Date.now());

  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
    try {
      const mod = await importer();
      if (
        !mod ||
        (typeof mod === 'object' && 'default' in mod && !(mod as { default?: unknown }).default)
      ) {
        throw new Error('Failed to fetch dynamically imported module: empty module');
      }
      clearChunkReloadAttempt(storage);
      return mod;
    } catch (err) {
      lastError = err;
      if (!isChunkLoadError(err)) {
        throw err;
      }
      if (attempt < maxRetries && retryDelayMs > 0) {
        await new Promise((resolve) => setTimeout(resolve, retryDelayMs));
      }
    }
  }

  if (isChunkLoadError(lastError) && canAttemptChunkReload(storage, nowFn())) {
    markChunkReloadAttempt(storage, nowFn());
    if (options.onChunkErrorReload) {
      options.onChunkErrorReload();
    } else if (typeof window !== 'undefined') {
      void purgeBrowserCachesAndUpdateSW().finally(() => {
        triggerCacheBustingReload();
      });
    }
    // Keep Suspense fallback visible briefly while navigation/reload happens
    return new Promise<T>(() => undefined);
  }

  throw lastError;
}

export function lazyWithRetry<T extends React.ComponentType<any>>(
  importer: () => Promise<{ default: T }>
): React.LazyExoticComponent<T> {
  return React.lazy(() => lazyImportWithRetry(importer));
}
