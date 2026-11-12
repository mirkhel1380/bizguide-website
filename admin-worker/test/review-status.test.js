import test from 'node:test';
import assert from 'node:assert/strict';
import { changeReviewStatus } from '../src/review-status.js';

function fakeDB(changes=1) {
 const statements=[];
 return {
  statements,
  prepare(sql){return {bind(...params){const s={sql,params};statements.push(s);return s;}};},
  async batch(s){return [{meta:{changes:changes}},{meta:{changes:changes}}];}
 };
}
test('records an audit entry and conditional update together',async()=>{
 const db=fakeDB();
 const r=await changeReviewStatus(db,'DEMO-1001','quote_requested','review_required');
 assert.equal(r.changed,true);
 assert.equal(db.statements.length,2);
 assert.match(db.statements[0].sql,/INSERT INTO order_audit/);
 assert.match(db.statements[1].sql,/WHERE id = \? AND status = \?/);
});
test('blocks manually marking payment verified or complete',async()=>{
 const db=fakeDB();
 await assert.rejects(changeReviewStatus(db,'DEMO-1001','review_required','paid_verified'),TypeError);
 await assert.rejects(changeReviewStatus(db,'DEMO-1001','review_required','complete'),TypeError);
 assert.equal(db.statements.length,0);
});
test('returns no change for stale status',async()=>{
 const db=fakeDB(0);
 assert.deepEqual(await changeReviewStatus(db,'DEMO-1001','quote_requested','review_required'),{changed:false});
});
