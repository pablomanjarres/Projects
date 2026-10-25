import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { test } from 'node:test';
const require = createRequire(import.meta.url);
const { SourceMapConsumer } = require('source-map-js');
const flat = { version: 3, sources: ['input.js'], names: [], mappings: 'AAAA' };

test('indexed maps reject offsets that amplify a tiny input into excessive work', () => {
  const map = { version: 3, sections: [{ offset: { line: 10_000_001, column: 0 }, map: flat }] };
  assert.throws(() => new SourceMapConsumer(map), /must not exceed/);
});

test('ordinary indexed source maps still resolve their original source', () => {
  const consumer = new SourceMapConsumer({ version: 3, sections: [{ offset: { line: 0, column: 0 }, map: flat }] });
  assert.equal(consumer.originalPositionFor({ line: 1, column: 1 }).source, 'input.js');
});
