export type BuildSource = 'github-actions' | 'git-local' | 'local-preview';

export interface RawBuildCommitInfo {
  commitSha?: string | null;
  branch?: string | null;
  repository?: string | null;
  serverUrl?: string | null;
  commitMessage?: string | null;
  commitAuthor?: string | null;
  commitDate?: string | null;
  runNumber?: string | null;
  builtAt?: string | null;
  source?: BuildSource | null;
}

export interface ResolvedBuildCommitInfo {
  commitSha: string | null;
  shortSha: string | null;
  branch: string | null;
  repository: string | null;
  commitUrl: string | null;
  commitMessage: string | null;
  commitAuthor: string | null;
  commitDate: string | null;
  runNumber: string | null;
  builtAt: string;
  source: BuildSource;
  hasCommit: boolean;
}

const PERSIAN_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];

function toFaDigits(input: string): string {
  return input.replace(/\d/g, (digit) => PERSIAN_DIGITS[Number(digit)] ?? digit);
}

export function parseGithubRepoFromRemote(remoteUrl?: string | null): string | null {
  if (!remoteUrl) return null;
  const trimmed = remoteUrl.trim();
  if (!trimmed) return null;

  // Match https://github.com/owner/repo(.git) or ssh git@github.com:owner/repo(.git)
  const httpsMatch = trimmed.match(/^https?:\/\/[^/]*github\.com\/([^/\s]+\/[^/\s]+?)(?:\.git)?\/?$/i);
  if (httpsMatch?.[1]) {
    return httpsMatch[1];
  }

  const sshMatch = trimmed.match(/^git@github\.com:([^/\s]+\/[^/\s]+?)(?:\.git)?$/i);
  if (sshMatch?.[1]) {
    return sshMatch[1];
  }

  // Already owner/repo format
  const slugMatch = trimmed.match(/^([A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+)$/);
  if (slugMatch?.[1]) {
    return slugMatch[1].replace(/\.git$/i, '');
  }

  return null;
}

export function getShortSha(sha?: string | null): string | null {
  if (!sha) return null;
  const cleaned = sha.trim();
  if (!/^[0-9a-f]{7,40}$/i.test(cleaned)) {
    return null;
  }
  return cleaned.slice(0, 7).toLowerCase();
}

export function buildCommitUrl(
  repository: string | null,
  sha: string | null,
  serverUrl?: string | null
): string | null {
  if (!repository || !sha) return null;
  const cleanRepo = parseGithubRepoFromRemote(repository);
  const cleanSha = sha.trim();
  if (!cleanRepo || !/^[0-9a-f]{7,40}$/i.test(cleanSha)) {
    return null;
  }
  const base = (serverUrl || 'https://github.com').trim().replace(/\/+$/, '');
  return `${base}/${cleanRepo}/commit/${cleanSha}`;
}

export function formatBuildInfo(raw: RawBuildCommitInfo): ResolvedBuildCommitInfo {
  const rawSha = raw.commitSha?.trim() || null;
  const shortSha = getShortSha(rawSha);
  const commitSha = shortSha && rawSha ? rawSha.toLowerCase() : null;
  const repository = parseGithubRepoFromRemote(raw.repository);
  const branch = raw.branch?.trim() || null;
  const commitMessage = raw.commitMessage?.trim() || null;
  const commitAuthor = raw.commitAuthor?.trim() || null;
  const commitDate = raw.commitDate?.trim() || null;
  const runNumber = raw.runNumber?.trim() || null;
  const builtAt = raw.builtAt?.trim() || new Date().toISOString();

  let source: BuildSource = raw.source || 'local-preview';
  if (!raw.source) {
    if (runNumber && commitSha) {
      source = 'github-actions';
    } else if (commitSha) {
      source = 'git-local';
    } else {
      source = 'local-preview';
    }
  }

  return {
    commitSha,
    shortSha,
    branch,
    repository,
    commitUrl: buildCommitUrl(repository, commitSha, raw.serverUrl),
    commitMessage,
    commitAuthor,
    commitDate,
    runNumber,
    builtAt,
    source,
    hasCommit: Boolean(commitSha && shortSha),
  };
}

export function formatIsoToFaDateTime(iso: string | null | undefined): string {
  if (!iso) return 'نامشخص';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return 'نامشخص';
  try {
    return new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return toFaDigits(date.toISOString().slice(0, 16).replace('T', ' '));
  }
}

export function getCurrentBuildInfo(): ResolvedBuildCommitInfo {
  const injected = typeof __APP_BUILD_INFO__ !== 'undefined' ? __APP_BUILD_INFO__ : undefined;
  const env = (typeof import.meta !== 'undefined' ? (import.meta as { env?: Record<string, string | undefined> }).env : undefined) || {};

  return formatBuildInfo({
    commitSha: env.VITE_GIT_COMMIT_SHA || injected?.commitSha || null,
    branch: env.VITE_GIT_BRANCH || injected?.branch || null,
    repository: env.VITE_GITHUB_REPO || injected?.repository || null,
    serverUrl: injected?.serverUrl || null,
    commitMessage: env.VITE_GIT_COMMIT_MESSAGE || injected?.commitMessage || null,
    commitAuthor: env.VITE_GIT_COMMIT_AUTHOR || injected?.commitAuthor || null,
    commitDate: env.VITE_GIT_COMMIT_DATE || injected?.commitDate || null,
    runNumber: env.VITE_GITHUB_RUN_NUMBER || injected?.runNumber || null,
    builtAt: injected?.builtAt || null,
    source: injected?.source || null,
  });
}
