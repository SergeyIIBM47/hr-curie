// In-memory login rate limiter.
// TODO: Use Redis in production for multi-instance deployments.

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
// Entries are only evicted lazily on read, so cap the store to keep
// attacker-chosen emails from growing memory without bound.
const MAX_STORE_ENTRIES = 10_000;

interface AttemptRecord {
  count: number;
  firstAttempt: number;
}

// Next.js bundles each route handler into its own chunk graph, which can
// instantiate this module multiple times. Keep the store on globalThis so
// the /api/auth/rate-limit pre-check and authorize() see the same state
// (same pattern as the prisma singleton).
const globalForRateLimit = globalThis as unknown as {
  loginAttemptStore: Map<string, AttemptRecord> | undefined;
};

const store =
  globalForRateLimit.loginAttemptStore ?? new Map<string, AttemptRecord>();
globalForRateLimit.loginAttemptStore = store;

export function isLoginRateLimited(email: string): boolean {
  const key = email.toLowerCase();
  const now = Date.now();
  const record = store.get(key);

  if (!record) return false;

  if (now - record.firstAttempt > WINDOW_MS) {
    store.delete(key);
    return false;
  }

  return record.count >= MAX_ATTEMPTS;
}

function evictIfFull(now: number): void {
  if (store.size < MAX_STORE_ENTRIES) return;

  for (const [key, record] of store) {
    if (now - record.firstAttempt > WINDOW_MS) store.delete(key);
  }

  // Still full after purging expired entries: drop oldest insertions.
  while (store.size >= MAX_STORE_ENTRIES) {
    const oldest = store.keys().next().value;
    if (oldest === undefined) break;
    store.delete(oldest);
  }
}

export function recordLoginFailure(email: string): void {
  const key = email.toLowerCase();
  const now = Date.now();
  const record = store.get(key);

  if (!record || now - record.firstAttempt > WINDOW_MS) {
    evictIfFull(now);
    store.set(key, { count: 1, firstAttempt: now });
    return;
  }

  store.set(key, { ...record, count: record.count + 1 });
}

export function clearLoginFailures(email: string): void {
  store.delete(email.toLowerCase());
}
