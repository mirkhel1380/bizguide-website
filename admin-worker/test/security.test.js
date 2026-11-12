import test from 'node:test';
import assert from 'node:assert/strict';
import worker from '../src/index.js';

const url = 'https://admin.example.test/api/admin/orders';
const request = (headers = {}, method = 'GET', path = url) => new Request(path, { method, headers });

test('fails closed when security configuration is missing', async () => {
  const response = await worker.fetch(request(), {});
  assert.equal(response.status, 401);
  assert.equal(response.headers.get('cache-control'), 'no-store');
});

test('rejects a client-supplied identity without a signed Access JWT', async () => {
  const env = {
    CF_ACCESS_TEAM_DOMAIN: 'https://example.cloudflareaccess.com',
    CF_ACCESS_AUD: 'test-audience',
    ADMIN_EMAIL: 'owner@example.com',
    DB: { prepare() { throw Error('Database should never be used'); } }
  };
  const response = await worker.fetch(request({ 'Cf-Access-Authenticated-User-Email': 'owner@example.com' }), env);
  assert.equal(response.status, 401);
});

test('rejects unsigned or malformed Access JWTs', async () => {
  const env = {
    CF_ACCESS_TEAM_DOMAIN: 'https://example.cloudflareaccess.com',
    CF_ACCESS_AUD: 'test-audience',
    ADMIN_EMAIL: 'owner@example.com'
  };
  const response = await worker.fetch(request({ 'Cf-Access-Jwt-Assertion': 'not.a.valid.jwt' }), env);
  assert.equal(response.status, 401);
});

test('rejects methods that could mutate data, before authorization', async () => {
  const response = await worker.fetch(request({}, 'POST'), {});
  assert.equal(response.status, 401);
});

test('rejects invalid Access team URL before any token verification', async () => {
  const env = {
    CF_ACCESS_TEAM_DOMAIN: 'https://attacker.example',
    CF_ACCESS_AUD: 'aud',
    ADMIN_EMAIL: 'owner@example.com'
  };
  const response = await worker.fetch(request({ 'Cf-Access-Jwt-Assertion': 'abc' }), env);
  assert.equal(response.status, 401);
});
