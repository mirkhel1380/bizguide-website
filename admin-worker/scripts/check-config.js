import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve, dirname } from 'node:path';

export function validateDeploymentConfig(config) {
  const errors = [];
  if (config.workers_dev !== false) errors.push('workers_dev must be false');
  if (config.preview_urls !== false) errors.push('preview_urls must be false');
  if (config.name !== 'bizguide-admin-api') errors.push('Unexpected Worker name');
  if (config.main !== 'src/index.js') errors.push('Unexpected entrypoint');
  const vars = config.vars ?? {};
  if (!/^https:\/\/[a-z0-9-]+\.cloudflareaccess\.com$/.test(vars.CF_ACCESS_TEAM_DOMAIN ?? '')) errors.push('Invalid Access team domain');
  if (typeof vars.CF_ACCESS_AUD !== 'string' || !/^[a-zA-Z0-9]{20,}$/.test(vars.CF_ACCESS_AUD)) errors.push('Access AUD is missing or invalid');
  if (typeof vars.ADMIN_EMAIL !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(vars.ADMIN_EMAIL)) errors.push('Admin email is missing');
  if (vars.ENABLE_STAFF_QUOTE_DRAFTS === 'true' || vars.ENABLE_STAFF_QUOTE_DRAFTS === true) errors.push('Staff quote writes must remain disabled for initial deployment');
  const databases = config.d1_databases ?? [];
  if (databases.length !== 1 || databases[0].binding !== 'DB' ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(databases[0]?.database_id ?? '')) {
    errors.push('One valid D1 DB binding is required');
  }
  const routes = config.routes ?? (config.route ? [config.route] : []);
  if (routes.length !== 1 || typeof routes[0] !== 'object' ||
      !/^admin\.[a-z0-9.-]+$/.test(routes[0]?.pattern ?? '') ||
      typeof routes[0]?.zone_name !== 'string' || !routes[0]?.zone_name ||
      routes[0].pattern !== 'admin.' + routes[0].zone_name) {
    errors.push('Exactly one explicit admin hostname route and zone_name required');
  }
  return errors;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const dir = resolve(dirname(fileURLToPath(import.meta.url)), '..');
  const filepath = resolve(dir, 'wrangler.jsonc');
  try {
    const data = readFileSync(filepath, 'utf8');
    const config = JSON.parse(data.replace(/^\s*\/\/.*$/gm, ''));
    const errors = validateDeploymentConfig(config);
    if (errors.length) {
      console.error('Cloudflare deployment blocked:\n- ' + errors.join('\n- '));
      process.exitCode = 1;
    } else {
      console.log('Configuration checks passed. Verify Cloudflare Access policy/MFA manually before deployment.');
    }
  } catch {
    console.error('Cloudflare deployment blocked: missing or malformed wrangler.jsonc');
    process.exitCode = 1;
  }
}
