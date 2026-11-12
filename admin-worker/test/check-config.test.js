import test from 'node:test';
import assert from 'node:assert/strict';
import { validateDeploymentConfig } from '../scripts/check-config.js';
const valid = {
  name: 'bizguide-admin-api', main: 'src/index.js',
  workers_dev: false, preview_urls: false,
  vars: {
    CF_ACCESS_TEAM_DOMAIN: 'https://example.cloudflareaccess.com',
    CF_ACCESS_AUD: 'a'.repeat(64), ADMIN_EMAIL: 'owner@example.com'
  },
  d1_databases: [{ binding: 'DB', database_id: '11111111-1111-4111-8111-111111111111' }],
  routes: [{ pattern: 'admin.example.com', zone_name: 'example.com' }]
};
test('accepts strictly configured admin deployment', () => {
  assert.deepEqual(validateDeploymentConfig(valid), []);
});
test('blocks public workers.dev/preview deployment', () => {
  assert.ok(validateDeploymentConfig({...valid, workers_dev: true}).length);
  assert.ok(validateDeploymentConfig({...valid, preview_urls: true}).length);
});
test('blocks missing admin Access and DB configuration', () => {
  assert.ok(validateDeploymentConfig({...valid, vars: {}}).length);
  assert.ok(validateDeploymentConfig({...valid, d1_databases: []}).length);
});
test('blocks enabling customer quote writes', () => {
  assert.ok(validateDeploymentConfig({...valid, vars: {...valid.vars, ENABLE_STAFF_QUOTE_DRAFTS: 'true'}}).length);
});
test('blocks unscoped routes', () => {
  assert.ok(validateDeploymentConfig({...valid, routes: [{pattern:'example.com/*', zone_name:'example.com'}]}).length);
});
