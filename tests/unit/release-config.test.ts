import { readFile } from 'node:fs/promises';
import sharp from 'sharp';
import { describe, expect, test } from 'vitest';

describe('release configuration regressions', () => {
  test('ships response policy, cache policy, manifest MIME, and a real 404 override', async () => {
    const config = JSON.parse(await readFile('staticwebapp.config.json', 'utf8'));
    expect(config.globalHeaders['Content-Security-Policy']).toContain("default-src 'self'");
    expect(config.globalHeaders['Permissions-Policy']).toContain('camera=()');
    expect(config.globalHeaders['X-Frame-Options']).toBe('DENY');
    expect(config.routes.find((route: { route: string }) => route.route === '/assets/*').headers['Cache-Control']).toContain('immutable');
    expect(config.routes.find((route: { route: string }) => route.route === '/manifest.webmanifest').headers['Content-Type']).toBe('application/manifest+json');
    expect(config.mimeTypes['.webmanifest']).toBe('application/manifest+json');
    expect(config.navigationFallback.exclude).toContain('/*');
    expect(config.responseOverrides['404']).toEqual({ rewrite: '/404/index.html', statusCode: 404 });
  });

  test('builds a content-derived service-worker cache name and publishes all direct routes', async () => {
    const buildScript = await readFile('scripts/build-sw.mjs', 'utf8');
    const worker = await readFile('src/sw-template.js', 'utf8');
    const vite = await readFile('vite.config.ts', 'utf8');
    expect(buildScript).toContain("createHash('sha256')");
    expect(buildScript).toContain('routeAliases');
    expect(worker).toContain("'__CACHE_NAME__'");
    expect(vite).toContain("demo: resolve(__dirname, 'demo/index.html')");
    expect(vite).toContain("notFound: resolve(__dirname, '404/index.html')");
  });

  test('lists every public claim with exactly one tagged regression test', async () => {
    const claims = JSON.parse(await readFile('.factory/claims.json', 'utf8')) as { id: string; test: string }[];
    const e2e = await readFile('tests/e2e/app.spec.ts', 'utf8');
    const ids = claims.map((claim) => claim.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const claim of claims) {
      expect(claim.test).toBe(`npx playwright test --grep @claim:${claim.id}`);
      expect(e2e.split(`@claim:${claim.id}`).length - 1).toBe(1);
    }
    const taggedIds = [...e2e.matchAll(/@claim:([a-z0-9-]+)/g)].map((match) => match[1]);
    expect(taggedIds.sort()).toEqual([...ids].sort());
  });

  test('publishes complete social metadata and a 1200 by 630 product image on every route', async () => {
    for (const path of ['index.html', 'demo/index.html', 'privacy/index.html', 'terms/index.html', '404/index.html']) {
      const html = await readFile(path, 'utf8');
      expect(html).toContain('property="og:title"');
      expect(html).toContain('property="og:description"');
      expect(html).toContain('property="og:image"');
      expect(html).toContain('name="twitter:card" content="summary_large_image"');
      expect(html).toContain('name="twitter:image"');
    }
    const metadata = await sharp('public/assets/social-card.jpg').metadata();
    expect(metadata.width).toBe(1200);
    expect(metadata.height).toBe(630);
  });

  test('keeps the designed 404 inside the standard site shell', async () => {
    const html = await readFile('404/index.html', 'utf8');
    expect((html.match(/<header\b/g) || [])).toHaveLength(1);
    expect((html.match(/<main\b/g) || [])).toHaveLength(1);
    expect((html.match(/<h1\b/g) || [])).toHaveLength(1);
    expect((html.match(/<footer\b/g) || [])).toHaveLength(1);
    expect(html).toContain('aria-label="Primary"');
    expect(html).toContain('Built by Param Factory');
  });
});
