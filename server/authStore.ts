import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

export type OtpPurpose = 'signup' | 'login' | 'reset-password' | 'change-email';

export interface StoredAddress {
  id: string;
  label: string;
  receiverName: string;
  phone: string;
  city: string;
  address: string;
  postalCode: string;
  isDefault: boolean;
}

export interface StoredUserRecord {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  nationalId?: string;
  birthDate?: string;
  newsletterOptIn: boolean;
  emailVerified: boolean;
  passwordHash?: string;
  addresses: StoredAddress[];
  activeSessionIds: string[];
  createdAt: string;
  lastLoginAt: string;
}

export interface PublicUserDTO {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  nationalId?: string;
  birthDate?: string;
  newsletterOptIn: boolean;
  emailVerified: boolean;
  hasPassword: boolean;
  addresses: StoredAddress[];
  createdAt: string;
  lastLoginAt: string;
}

interface AuthDatabaseFile {
  sessionSecret: string;
  users: StoredUserRecord[];
}

interface OtpChallenge {
  id: string;
  email: string;
  purpose: OtpPurpose;
  codeHash: string;
  expiresAt: number;
  resendAvailableAt: number;
  attempts: number;
  pendingUserId?: string;
  pendingSignup?: {
    fullName: string;
    phone: string;
    passwordHash?: string;
  };
}

const DATA_DIR = path.resolve(process.cwd(), '.data');
const DB_PATH = path.join(DATA_DIR, 'auth-db.json');

function ensureDb(): AuthDatabaseFile {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DB_PATH)) {
    const initial: AuthDatabaseFile = {
      sessionSecret: crypto.randomBytes(32).toString('hex'),
      users: [],
    };
    fs.writeFileSync(DB_PATH, JSON.stringify(initial, null, 2), 'utf8');
    return initial;
  }
  try {
    const raw = fs.readFileSync(DB_PATH, 'utf8');
    const parsed = JSON.parse(raw) as Partial<AuthDatabaseFile>;
    return {
      sessionSecret: parsed.sessionSecret || crypto.randomBytes(32).toString('hex'),
      users: Array.isArray(parsed.users) ? parsed.users : [],
    };
  } catch {
    return {
      sessionSecret: crypto.randomBytes(32).toString('hex'),
      users: [],
    };
  }
}

function saveDb(db: AuthDatabaseFile): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf8');
}

function getSigningSecret(): string {
  const envSecret = (process.env.AUTH_SESSION_SECRET || '').trim();
  if (envSecret.length >= 16) return envSecret;
  return ensureDb().sessionSecret;
}

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${derived}`;
}

export function verifyPassword(password: string, storedHash?: string): boolean {
  if (!storedHash || !storedHash.includes(':')) return false;
  const [salt, hexKey] = storedHash.split(':');
  if (!salt || !hexKey) return false;
  const expectedBuf = Buffer.from(hexKey, 'hex');
  const actualBuf = crypto.scryptSync(password, salt, 64);
  if (expectedBuf.length !== actualBuf.length) return false;
  return crypto.timingSafeEqual(expectedBuf, actualBuf);
}

function hashOtpCode(code: string, email: string): string {
  return crypto.createHmac('sha256', getSigningSecret()).update(`${email}:${code}`).digest('hex');
}

export function toPublicUser(user: StoredUserRecord): PublicUserDTO {
  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    phone: user.phone,
    nationalId: user.nationalId,
    birthDate: user.birthDate,
    newsletterOptIn: user.newsletterOptIn,
    emailVerified: user.emailVerified,
    hasPassword: Boolean(user.passwordHash),
    addresses: user.addresses,
    createdAt: user.createdAt,
    lastLoginAt: user.lastLoginAt,
  };
}

const otpChallenges = new Map<string, OtpChallenge>();

function otpKey(email: string, purpose: OtpPurpose): string {
  return `${purpose}::${email}`;
}

export function findUserByEmail(email: string): StoredUserRecord | null {
  const db = ensureDb();
  return db.users.find((u) => u.email === email) || null;
}

export function findUserById(userId: string): StoredUserRecord | null {
  const db = ensureDb();
  return db.users.find((u) => u.id === userId) || null;
}

export function createOtpChallenge(params: {
  email: string;
  purpose: OtpPurpose;
  pendingUserId?: string;
  pendingSignup?: {
    fullName: string;
    phone: string;
    passwordHash?: string;
  };
}):
  | { ok: true; code: string; challengeId: string; cooldownSeconds: number }
  | { ok: false; retryAfterSeconds: number } {
  const key = otpKey(params.email, params.purpose);
  const existing = otpChallenges.get(key);
  const now = Date.now();

  if (existing && existing.resendAvailableAt > now) {
    return {
      ok: false,
      retryAfterSeconds: Math.max(1, Math.ceil((existing.resendAvailableAt - now) / 1000)),
    };
  }

  const code = String(crypto.randomInt(100000, 1000000));
  const challengeId = crypto.randomUUID();

  otpChallenges.set(key, {
    id: challengeId,
    email: params.email,
    purpose: params.purpose,
    codeHash: hashOtpCode(code, params.email),
    expiresAt: now + 10 * 60 * 1000,
    resendAvailableAt: now + 60 * 1000,
    attempts: 0,
    pendingUserId: params.pendingUserId,
    pendingSignup: params.pendingSignup,
  });

  return { ok: true, code, challengeId, cooldownSeconds: 60 };
}

export function clearOtpChallenge(email: string, purpose: OtpPurpose): void {
  otpChallenges.delete(otpKey(email, purpose));
}

export function verifyOtpChallenge(
  email: string,
  purpose: OtpPurpose,
  code: string
):
  | {
      ok: true;
      challenge: OtpChallenge;
    }
  | {
      ok: false;
      messageFa: string;
    } {
  const key = otpKey(email, purpose);
  const challenge = otpChallenges.get(key);

  if (!challenge) {
    return {
      ok: false,
      messageFa: 'کد تاییدی برای این ایمیل صادر نشده یا منقضی شده است. لطفاً دوباره درخواست کد دهید.',
    };
  }

  if (Date.now() > challenge.expiresAt) {
    otpChallenges.delete(key);
    return {
      ok: false,
      messageFa: 'مدت اعتبار کد تایید (۱۰ دقیقه) به پایان رسیده است. لطفاً کد جدید دریافت کنید.',
    };
  }

  if (challenge.attempts >= 5) {
    otpChallenges.delete(key);
    return {
      ok: false,
      messageFa: 'تعداد تلاش‌های ناموفق بیش از حد مجاز بود. لطفاً کد جدید دریافت کنید.',
    };
  }

  const candidateHash = hashOtpCode(code, email);
  const a = Buffer.from(candidateHash, 'hex');
  const b = Buffer.from(challenge.codeHash, 'hex');

  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    challenge.attempts += 1;
    return {
      ok: false,
      messageFa: `کد تایید نادرست است (${5 - challenge.attempts} تلاش باقی‌مانده).`,
    };
  }

  otpChallenges.delete(key);
  return { ok: true, challenge };
}

export function createUserAccount(params: {
  email: string;
  fullName: string;
  phone: string;
  passwordHash?: string;
}): StoredUserRecord {
  const db = ensureDb();
  const nowIso = new Date().toISOString();
  const newUser: StoredUserRecord = {
    id: crypto.randomUUID(),
    email: params.email,
    fullName: params.fullName.trim(),
    phone: params.phone.trim(),
    newsletterOptIn: true,
    emailVerified: true,
    passwordHash: params.passwordHash,
    addresses: [],
    activeSessionIds: [],
    createdAt: nowIso,
    lastLoginAt: nowIso,
  };
  db.users.push(newUser);
  saveDb(db);
  return newUser;
}

export function updateUserRecord(
  userId: string,
  updater: (user: StoredUserRecord) => StoredUserRecord
): StoredUserRecord | null {
  const db = ensureDb();
  const idx = db.users.findIndex((u) => u.id === userId);
  if (idx < 0) return null;
  const updated = updater(db.users[idx]);
  db.users[idx] = updated;
  saveDb(db);
  return updated;
}

export function issueSessionToken(userId: string): { token: string; sessionId: string } | null {
  const sessionId = crypto.randomUUID();
  const issuedAt = Date.now();
  const updated = updateUserRecord(userId, (user) => ({
    ...user,
    lastLoginAt: new Date().toISOString(),
    activeSessionIds: [...user.activeSessionIds.slice(-9), sessionId],
  }));
  if (!updated) return null;

  const payload = `${sessionId}.${userId}.${issuedAt}`;
  const signature = crypto.createHmac('sha256', getSigningSecret()).update(payload).digest('hex');
  return {
    token: `${payload}.${signature}`,
    sessionId,
  };
}

export function verifySessionToken(
  token: string | undefined
): { user: StoredUserRecord; sessionId: string } | null {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 4) return null;

  const [sessionId, userId, issuedAtStr, signature] = parts;
  if (!sessionId || !userId || !issuedAtStr || !signature) return null;

  const issuedAt = Number(issuedAtStr);
  if (!Number.isFinite(issuedAt)) return null;

  const maxAgeMs = 7 * 24 * 60 * 60 * 1000;
  if (Date.now() - issuedAt > maxAgeMs) return null;

  const payload = `${sessionId}.${userId}.${issuedAtStr}`;
  const expectedSig = crypto
    .createHmac('sha256', getSigningSecret())
    .update(payload)
    .digest('hex');

  const sigBuf = Buffer.from(signature, 'hex');
  const expBuf = Buffer.from(expectedSig, 'hex');
  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
    return null;
  }

  const user = findUserById(userId);
  if (!user || !user.activeSessionIds.includes(sessionId)) {
    return null;
  }
  return { user, sessionId };
}

export function revokeSession(userId: string, sessionId: string, allDevices = false): void {
  updateUserRecord(userId, (user) => ({
    ...user,
    activeSessionIds: allDevices
      ? []
      : user.activeSessionIds.filter((id) => id !== sessionId),
  }));
}
