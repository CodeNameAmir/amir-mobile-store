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

function generateSitemapPlugin(): Plugin {
  return {
    name: 'generate-static-sitemap',
    closeBundle() {
      const rootDir = import.meta.dirname;
      const distDir = path.resolve(rootDir, 'dist');
      if (!fs.existsSync(distDir)) return;

      const siteOrigin = (
        process.env.VITE_SITE_URL || 'https://amir-mobile-store.codenameamir.ir'
      ).replace(/\/+$/, '');
      const today = new Date().toISOString().slice(0, 10);
      const xmlEscape = (s: string) =>
        s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

      const staticRoutes: Array<{ path: string; changefreq: string; priority: string }> = [
        { path: '/', changefreq: 'daily', priority: '1.0' },
        { path: '/catalog', changefreq: 'daily', priority: '0.9' },
        { path: '/compare', changefreq: 'weekly', priority: '0.8' },
        { path: '/installments', changefreq: 'weekly', priority: '0.8' },
        { path: '/blog', changefreq: 'daily', priority: '0.9' },
        { path: '/faq', changefreq: 'monthly', priority: '0.7' },
        { path: '/about', changefreq: 'monthly', priority: '0.6' },
        { path: '/contact', changefreq: 'monthly', priority: '0.6' },
        { path: '/terms', changefreq: 'monthly', priority: '0.5' },
      ];

      const productSlugs = new Set<string>();
      const blogSlugs = new Set<string>();

      try {
        const storeDataSrc = fs.readFileSync(path.join(rootDir, 'server/storeData.ts'), 'utf8');
        const productsSectionStart = storeDataSrc.indexOf('export const DEFAULT_DEV_PRODUCTS');
        const productsSectionEnd = storeDataSrc.indexOf('export const VALID_STOCK_MOVEMENT_TYPES');
        if (productsSectionStart >= 0 && productsSectionEnd > productsSectionStart) {
          const productsBlock = storeDataSrc.slice(productsSectionStart, productsSectionEnd);
          for (const m of productsBlock.matchAll(/slug:\s*'([^']+)'/g)) {
            if (m[1]) productSlugs.add(m[1]);
          }
        }
        const blogSectionStart = storeDataSrc.indexOf('export const DEFAULT_DEV_BLOG_POSTS');
        if (blogSectionStart >= 0) {
          const blogBlock = storeDataSrc.slice(blogSectionStart);
          for (const m of blogBlock.matchAll(/slug:\s*'([^']+)'/g)) {
            if (m[1]) blogSlugs.add(m[1]);
          }
        }
      } catch {
        // Fallback silently if server/storeData.ts is unavailable
      }

      try {
        const digikalaSrc = fs.readFileSync(
          path.join(rootDir, 'src/data/digikalaProducts.ts'),
          'utf8'
        );
        const digiProdStart = digikalaSrc.indexOf('export const DIGIKALA_EXTRA_PRODUCTS');
        if (digiProdStart >= 0) {
          const digiBlock = digikalaSrc.slice(digiProdStart);
          for (const m of digiBlock.matchAll(/"slug":\s*"([^"]+)"/g)) {
            if (m[1]) productSlugs.add(m[1]);
          }
        }
      } catch {
        // Optional extra products seed
      }

      const urls: string[] = [];
      for (const route of staticRoutes) {
        urls.push(
          `  <url>\n    <loc>${xmlEscape(`${siteOrigin}${route.path}`)}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${route.changefreq}</changefreq>\n    <priority>${route.priority}</priority>\n  </url>`
        );
      }
      for (const slug of productSlugs) {
        urls.push(
          `  <url>\n    <loc>${xmlEscape(`${siteOrigin}/product/${encodeURIComponent(slug)}`)}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>0.8</priority>\n  </url>`
        );
      }
      for (const slug of blogSlugs) {
        urls.push(
          `  <url>\n    <loc>${xmlEscape(`${siteOrigin}/blog/${encodeURIComponent(slug)}`)}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.7</priority>\n  </url>`
        );
      }

      const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`;
      fs.writeFileSync(path.join(distDir, 'sitemap.xml'), xml, 'utf8');
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
    plugins: [react(), tailwindcss(), copyIndexTo404Plugin(), generateSitemapPlugin()],
    define: {
      __APP_BUILD_INFO__: JSON.stringify(buildInfo),
    },
    resolve: {
      dedupe: ['react', 'react-dom'],
      alias: {
        '@': path.resolve(import.meta.dirname, '.'),
      },
    },
    build: {
      rolldownOptions: {
        output: {
          manualChunks(id) {
            if (!id.includes('node_modules')) return undefined;
            if (id.includes('node_modules/react-dom/') || id.includes('node_modules/react/')) {
              return 'vendor-react';
            }
            if (id.includes('node_modules/motion/')) {
              return 'vendor-motion';
            }
            if (id.includes('node_modules/lucide-react/')) {
              return 'vendor-icons';
            }
            if (id.includes('node_modules/@supabase/')) {
              return 'vendor-supabase';
            }
            return undefined;
          },
        },
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
