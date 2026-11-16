import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildCommitUrl,
  formatBuildInfo,
  formatIsoToFaDateTime,
  getShortSha,
  parseGithubRepoFromRemote,
} from './buildInfo';

test('parseGithubRepoFromRemote extracts owner/repo from HTTPS, SSH, and slug formats', () => {
  assert.equal(parseGithubRepoFromRemote('https://github.com/amir/mobile-shop.git'), 'amir/mobile-shop');
  assert.equal(parseGithubRepoFromRemote('https://github.com/amir/mobile-shop'), 'amir/mobile-shop');
  assert.equal(parseGithubRepoFromRemote('git@github.com:amir/mobile-shop.git'), 'amir/mobile-shop');
  assert.equal(parseGithubRepoFromRemote('amir/mobile-shop'), 'amir/mobile-shop');
  assert.equal(parseGithubRepoFromRemote('https://gitlab.com/amir/shop.git'), null);
  assert.equal(parseGithubRepoFromRemote(''), null);
});

test('getShortSha validates SHA and returns 7 lowercase characters', () => {
  assert.equal(getShortSha('A1B2C3D4E5F6789012345678901234567890ABCD'), 'a1b2c3d');
  assert.equal(getShortSha('9f8e7d6'), '9f8e7d6');
  assert.equal(getShortSha('not-a-sha'), null);
  assert.equal(getShortSha('123'), null);
  assert.equal(getShortSha(null), null);
});

test('buildCommitUrl produces GitHub commit URL only when repo and SHA are valid', () => {
  assert.equal(
    buildCommitUrl('amir/mobile-shop', 'a1b2c3d4e5f67890'),
    'https://github.com/amir/mobile-shop/commit/a1b2c3d4e5f67890'
  );
  assert.equal(buildCommitUrl(null, 'a1b2c3d4e5f67890'), null);
  assert.equal(buildCommitUrl('amir/mobile-shop', null), null);
});

test('formatBuildInfo normalizes GitHub Actions metadata vs local preview fallback', () => {
  const ciInfo = formatBuildInfo({
    commitSha: 'ABCDEF1234567890ABCDEF1234567890ABCDEF12',
    branch: 'main',
    repository: 'amir/mobile-shop',
    commitMessage: 'feat: update catalog pricing',
    commitAuthor: 'Amir',
    commitDate: '2026-11-16T10:00:00Z',
    runNumber: '42',
    builtAt: '2026-11-16T10:01:00Z',
    source: 'github-actions',
  });

  assert.equal(ciInfo.hasCommit, true);
  assert.equal(ciInfo.shortSha, 'abcdef1');
  assert.equal(ciInfo.branch, 'main');
  assert.equal(ciInfo.source, 'github-actions');
  assert.equal(
    ciInfo.commitUrl,
    'https://github.com/amir/mobile-shop/commit/abcdef1234567890abcdef1234567890abcdef12'
  );

  const localFallback = formatBuildInfo({
    builtAt: '2026-11-16T10:01:00Z',
  });
  assert.equal(localFallback.hasCommit, false);
  assert.equal(localFallback.shortSha, null);
  assert.equal(localFallback.commitUrl, null);
  assert.equal(localFallback.source, 'local-preview');
});

test('formatIsoToFaDateTime formats valid dates and guards against invalid input', () => {
  const formatted = formatIsoToFaDateTime('2026-11-16T10:00:00Z');
  assert.ok(formatted.length > 0 && formatted !== 'نامشخص');
  assert.equal(formatIsoToFaDateTime('invalid-date'), 'نامشخص');
  assert.equal(formatIsoToFaDateTime(null), 'نامشخص');
});
