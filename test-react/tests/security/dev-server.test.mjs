import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';

test('development server blocks outside files through raw and import URL variants', { timeout: 15000 }, async () => {
  const root = fileURLToPath(new URL('../', import.meta.url));
  const outside = await fs.mkdtemp(path.join(os.tmpdir(), 'vite-deny-regression-'));
  const marker = 'synthetic-outside-file-marker';
  const fixture = path.join(outside, 'fixture.txt');
  let server;
  try {
    await fs.writeFile(fixture, marker);
    server = await createServer({
      root,
      configFile: path.join(root, 'vite.config.js'),
      logLevel: 'silent',
      server: { host: '127.0.0.1', port: 0, strictPort: false, hmr: false },
    });
    await server.listen();
    const base = `http://127.0.0.1:${server.httpServer.address().port}`;
    assert.equal((await fetch(base)).status, 200);
    for (const suffix of ['', '?raw', '?import&raw', '?raw??', '?url']) {
      const response = await fetch(`${base}/@fs${fixture}${suffix}`);
      const body = await response.text();
      assert.equal(response.status, 403, `outside file must be denied for ${suffix || 'plain URL'}`);
      assert.equal(body.includes(marker), false);
    }
  } finally {
    await server?.close();
    await fs.rm(outside, { recursive: true, force: true });
  }
});
