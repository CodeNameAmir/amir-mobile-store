import {execSync} from 'child_process';
import fs from 'node:fs';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, type Plugin} from 'vite';

function copyIndexTo404Plugin(): Plugin {
  return {
    name: 'copy-index-to-404',
    closeBundle() {
      const distDir = path.resolve(import.meta.dirname, 'dist');
      const indexFile = path.join(distDir, 'index.html');
      const fallbackFile = path.join(distDir, '404.html');
      if (fs.existsSync(indexFile)) {
        fs.copyFileSync(indexFile, fallbackFile);
      }
    },
  };
}

function readGit(command: string): string | null {
  try {
    const out = execSync(command, {stdio: ['ignore', 'pipe', 'ignore']})
      .toString()
      .trim();
    return out || null;
  } catch {
    return null;
  }
}

function resolveBuildCommitInfo() {
  const commitSha =
    process.env.VITE_GIT_COMMIT_SHA ||
    process.env.GITHUB_SHA ||
    readGit('git rev-parse HEAD');
  const branch =
    process.env.VITE_GIT_BRANCH ||
    process.env.GITHUB_REF_NAME ||
    readGit('git rev-parse --abbrev-ref HEAD');
  const repository =
    process.env.VITE_GITHUB_REPO ||
    process.env.GITHUB_REPOSITORY ||
    readGit('git remote get-url origin');
  const commitMessage =
    process.env.VITE_GIT_COMMIT_MESSAGE || readGit('git log -1 --pretty=%s');
  const commitAuthor =
    process.env.VITE_GIT_COMMIT_AUTHOR || readGit('git log -1 --pretty=%an');
  const commitDate =
    process.env.VITE_GIT_COMMIT_DATE || readGit('git log -1 --pretty=%cI');
  const runNumber =
    process.env.VITE_GITHUB_RUN_NUMBER || process.env.GITHUB_RUN_NUMBER || null;
  const serverUrl = process.env.GITHUB_SERVER_URL || 'https://github.com';
  const source =
    process.env.GITHUB_ACTIONS === 'true'
      ? 'github-actions'
      : commitSha
      ? 'git-local'
      : 'local-preview';

  return {
    commitSha,
    branch,
    repository,
    serverUrl,
    commitMessage,
    commitAuthor,
    commitDate,
    runNumber,
    builtAt: new Date().toISOString(),
    source,
  };
}

export default defineConfig(() => {
  const buildInfo = resolveBuildCommitInfo();

  return {
    // Root-absolute base ensures nested SPA routes resolve scripts and assets cleanly (override via VITE_BASE_PATH for subpath hosting)
    base: process.env.VITE_BASE_PATH || '/',
    plugins: [react(), tailwindcss(), copyIndexTo404Plugin()],
    define: {
      __APP_BUILD_INFO__: JSON.stringify(buildInfo),
    },
    resolve: {
      dedupe: ['react', 'react-dom'],
      alias: {
        '@': path.resolve(import.meta.dirname, '.'),
      },
    },
    optimizeDeps: {
      include: ['react', 'react-dom', 'react-dom/client', 'motion/react', 'lucide-react'],
    },
    server: {
      allowedHosts: true as const,
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
