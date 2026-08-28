import { readFile } from 'node:fs/promises';
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
});
