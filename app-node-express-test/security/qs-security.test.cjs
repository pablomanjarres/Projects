const assert = require('node:assert/strict');
const { test } = require('node:test');
const qs = require('qs');

test('bracket-key comma values respect the configured array limit', () => {
  assert.throws(
    () => qs.parse('a[]=1,2,3,4', {
      comma: true,
      arrayLimit: 3,
      throwOnLimitExceeded: true,
    }),
    RangeError,
  );
});

test('query round trips do not invoke an attacker-controlled isBuffer property', () => {
  for (const options of [{ plainObjects: true }, { allowPrototypes: true }]) {
    const parsed = qs.parse('x[constructor][isBuffer]=value', options);
    assert.doesNotThrow(() => qs.stringify(parsed));
  }
});

test('ordinary nested query values retain their parse and round-trip behavior', () => {
  const query = 'filter[name]=Ada&tags[0]=node&tags[1]=web';
  const expected = { filter: { name: 'Ada' }, tags: ['node', 'web'] };
  assert.deepEqual(qs.parse(query), expected);
  assert.deepEqual(qs.parse(qs.stringify(expected)), expected);
});
