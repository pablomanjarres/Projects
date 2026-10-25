const assert = require('node:assert/strict');
const { Readable } = require('node:stream');
const { test } = require('node:test');
const bodyParser = require('body-parser');
const pathToRegexp = require('path-to-regexp');

test('route parameters after a separator cannot consume that separator', () => {
  const expression = pathToRegexp('/:first-:second-:third');
  assert.deepEqual(expression.exec('/a-b-c').slice(1), ['a', 'b', 'c']);
  const captures = expression.exec('/a-b-c-d').slice(1);
  assert.equal(captures[1].includes('-'), false);
  assert.equal(captures[2].includes('-'), false);
});

test('URL-encoded parser rejects input beyond its configured depth', async () => {
  const bytes = Buffer.from('root[branch][leaf]=value');
  const request = Readable.from([bytes]);
  request.headers = { 'content-type': 'application/x-www-form-urlencoded', 'content-length': String(bytes.length) };
  const error = await new Promise(resolve => bodyParser.urlencoded({ extended: true, depth: 1 })(request, {}, resolve));
  assert.equal(error?.status, 400);
});
