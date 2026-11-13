import test from 'node:test';
import assert from 'node:assert/strict';
import { listOrders } from '../src/orders.js';

test('does not query without a database binding', async () => {
  await assert.rejects(listOrders(null), /Database unavailable/);
});
test('rejects non-whitelisted status before SQL execution', async () => {
  let executed = false;
  const db = { prepare() { executed = true; throw Error('should not execute'); } };
  await assert.rejects(listOrders(db, "' OR 1=1--"), RangeError);
  assert.equal(executed, false);
});
test('uses a parameter binding for status filtering', async () => {
  const calls = [];
  const rows = [{ id: 'EXAMPLE-1', status: 'quote_requested' }];
  const db = { prepare(sql) {
    calls.push(['prepare',sql]);
    return { bind(value) {
      calls.push(['bind',value]);
      return { async all() { return { results: rows }; } };
    } };
  } };
  assert.deepEqual(await listOrders(db, 'quote_requested'), rows);
  assert.match(calls[0][1], /WHERE o\.status = \?/);
  assert.match(calls[0][1], /AS services/);
  assert.equal(calls[1][1], 'quote_requested');
});
test('applies a 50-row cap without status filter', async () => {
  let sql;
  const db = { prepare(text) {
    sql = text;
    return { async all() { return { results: [] }; } };
  } };
  assert.deepEqual(await listOrders(db), []);
  assert.match(sql, /LIMIT 50$/);
  assert.doesNotMatch(sql, /WHERE o\.status =/);
});

test('includes service codes through a read-only subquery', async () => {
  let sql;
  const db = {prepare(query) {
    sql=query;
    return {async all(){return {results:[{id:'DEMO-1',services:'llc_formation'}]};}};
  }};
  const result=await listOrders(db);
  assert.deepEqual(result,[{id:'DEMO-1',services:'llc_formation'}]);
  assert.match(sql,/GROUP_CONCAT\(s\.service_code/);
  assert.match(sql,/s\.order_id = o\.id/);
});
