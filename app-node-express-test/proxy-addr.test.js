const assert = require('node:assert/strict');
const test = require('node:test');
const proxyaddr = require('proxy-addr');

test('IPv6 trust subnets do not trust arbitrary IPv4 clients', () => {
  for (const subnet of ['::ffff:10.0.0.0/8', '::/1']) {
    const trust = proxyaddr.compile(subnet);
    assert.equal(trust('198.51.100.10'), false, subnet);
    const request = {
      socket: { remoteAddress: '198.51.100.10' },
      headers: { 'x-forwarded-for': '203.0.113.99' },
    };
    assert.equal(proxyaddr(request, trust), '198.51.100.10', subnet);
  }
});

test('correct private IPv4 trust subnets preserve proxy behavior', () => {
  for (const subnet of ['10.0.0.0/8', '::ffff:10.0.0.0/104']) {
    const trust = proxyaddr.compile(subnet);
    assert.equal(trust('10.1.2.3'), true, subnet);
    assert.equal(trust('198.51.100.10'), false, subnet);
    const request = {
      socket: { remoteAddress: '10.1.2.3' },
      headers: { 'x-forwarded-for': '203.0.113.99' },
    };
    assert.equal(proxyaddr(request, trust), '203.0.113.99', subnet);
  }
});
