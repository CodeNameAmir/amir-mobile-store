import test from 'node:test';
import assert from 'node:assert/strict';
import {
  canAttemptChunkReload,
  CHUNK_RELOAD_COOLDOWN_MS,
  CHUNK_RELOAD_STORAGE_KEY,
  isChunkLoadError,
  lazyImportWithRetry,
  type StorageLike,
} from './lazyWithRetry';

function createMemoryStorage(): StorageLike {
  const map = new Map<string, string>();
  return {
    getItem: (key) => map.get(key) ?? null,
    setItem: (key, value) => {
      map.set(key, value);
    },
    removeItem: (key) => {
      map.delete(key);
    },
  };
}

test('isChunkLoadError recognizes Chrome, Safari, Firefox, and Vite preload chunk errors', () => {
  assert.equal(
    isChunkLoadError(new TypeError('Failed to fetch dynamically imported module: https://site/assets/ProductDetailPage-abc.js')),
    true
  );
  assert.equal(isChunkLoadError(new Error('Importing a module script failed.')), true);
  assert.equal(isChunkLoadError(new Error('error loading dynamically imported module')), true);
  assert.equal(isChunkLoadError(new Error('Unable to preload CSS for /assets/AccountPage.css')), true);
  const chunkErr = new Error('Loading chunk 42 failed');
  chunkErr.name = 'ChunkLoadError';
  assert.equal(isChunkLoadError(chunkErr), true);

  assert.equal(isChunkLoadError(new TypeError("Cannot read properties of undefined (reading 'id')")), false);
  assert.equal(isChunkLoadError(new ReferenceError('foo is not defined')), false);
  assert.equal(isChunkLoadError(null), false);
});

test('canAttemptChunkReload enforces cooldown to prevent infinite reload loops', () => {
  const storage = createMemoryStorage();
  assert.equal(canAttemptChunkReload(storage, 100_000), true);

  storage.setItem(CHUNK_RELOAD_STORAGE_KEY, String(100_000));
  assert.equal(canAttemptChunkReload(storage, 100_000 + 2_000), false);
  assert.equal(canAttemptChunkReload(storage, 100_000 + CHUNK_RELOAD_COOLDOWN_MS + 1), true);
});

test('lazyImportWithRetry retries transient chunk failures and resolves without reloading', async () => {
  const storage = createMemoryStorage();
  let calls = 0;
  let reloadCount = 0;

  const result = await lazyImportWithRetry(
    async () => {
      calls += 1;
      if (calls === 1) {
        throw new TypeError('Failed to fetch dynamically imported module');
      }
      return { default: 'ok' };
    },
    {
      retryDelayMs: 1,
      storage,
      onChunkErrorReload: () => {
        reloadCount += 1;
      },
    }
  );

  assert.deepEqual(result, { default: 'ok' });
  assert.equal(calls, 2);
  assert.equal(reloadCount, 0);
  assert.equal(storage.getItem(CHUNK_RELOAD_STORAGE_KEY), null);
});

test('lazyImportWithRetry triggers guarded reload once on persistent chunk error, then throws inside cooldown', async () => {
  const storage = createMemoryStorage();
  let reloadCount = 0;
  let now = 50_000;

  // First persistent chunk failure triggers reload callback and marks timestamp
  const pending = lazyImportWithRetry(
    async () => {
      throw new TypeError('Failed to fetch dynamically imported module');
    },
    {
      retryDelayMs: 1,
      maxRetries: 1,
      storage,
      now: () => now,
      onChunkErrorReload: () => {
        reloadCount += 1;
      },
    }
  );

  // Give async retries a moment to run
  await new Promise((r) => setTimeout(r, 20));
  assert.equal(reloadCount, 1);
  assert.equal(storage.getItem(CHUNK_RELOAD_STORAGE_KEY), String(now));
  void pending;

  // Second failure within cooldown does NOT reload again and rejects cleanly for ErrorBoundary
  now += 2_000;
  await assert.rejects(
    () =>
      lazyImportWithRetry(
        async () => {
          throw new TypeError('Failed to fetch dynamically imported module');
        },
        {
          retryDelayMs: 1,
          maxRetries: 1,
          storage,
          now: () => now,
          onChunkErrorReload: () => {
            reloadCount += 1;
          },
        }
      ),
    /dynamically imported module/i
  );
  assert.equal(reloadCount, 1);
});

test('lazyImportWithRetry rethrows non-chunk errors immediately without retrying or reloading', async () => {
  const storage = createMemoryStorage();
  let calls = 0;
  let reloadCount = 0;

  await assert.rejects(
    () =>
      lazyImportWithRetry(
        async () => {
          calls += 1;
          throw new ReferenceError('broken component');
        },
        {
          retryDelayMs: 1,
          maxRetries: 2,
          storage,
          onChunkErrorReload: () => {
            reloadCount += 1;
          },
        }
      ),
    /broken component/i
  );

  assert.equal(calls, 1);
  assert.equal(reloadCount, 0);
});

test('lazyImportWithRetry treats empty or missing default export as a retryable chunk error', async () => {
  const storage = createMemoryStorage();
  let calls = 0;

  const result = await lazyImportWithRetry(
    async () => {
      calls += 1;
      if (calls === 1) {
        return { default: undefined } as unknown as { default: string };
      }
      return { default: 'recovered' };
    },
    { retryDelayMs: 1, storage }
  );

  assert.deepEqual(result, { default: 'recovered' });
  assert.equal(calls, 2);
});

