import test from "node:test";
import assert from "node:assert/strict";
import { saveQuoteDraft } from "../src/quote-drafts.js";
const id="f1b5ff5e-2ac4-482b-8cdc-1b07ec581007";
const selection={ state:"WY", companyStatus:"not_formed", services:["llc_formation", "registered_agent"] };

function mockDB(){
  const calls=[]; let batches=0;
  const db={prepare(sql){return {bind(...args){calls.push({sql,args});return {sql,args};}};},
    async batch(stmts){batches++;assert.equal(stmts.length,4);return stmts;}};
  return {db,calls,get batches(){return batches;}};
}

test("saves only selection metadata via D1 batch",async()=>{
  const obj=mockDB();
  assert.deepEqual(await saveQuoteDraft(obj.db,selection,id),{id,status:"quote_requested"});
  assert.equal(obj.batches,1);
  assert.equal(obj.calls.length,4);
  assert.deepEqual(obj.calls[0].args,[id,"WY","not_formed"]);
  assert.deepEqual(obj.calls.slice(1,3).map(x=>x.args[1]),selection.services);
  assert.ok(obj.calls.every(x=>!x.sql.includes("ssn")));
});
test("rejects unexpected personal information before any database write",async()=>{
  const obj=mockDB();
  await assert.rejects(saveQuoteDraft(obj.db,{...selection,email:"private@example.com"},id),TypeError);
  assert.equal(obj.batches,0);
});
test("rejects invalid order IDs and absent DB",async()=>{
  const obj=mockDB();
  await assert.rejects(saveQuoteDraft(obj.db,selection,"bad-id"),TypeError);
  await assert.rejects(saveQuoteDraft(null,selection,id),/Database unavailable/);
  assert.equal(obj.batches,0);
});
test("propagates database errors without reporting order creation",async()=>{
  const db={prepare(sql){return{bind(...args){return{sql,args};}};},async batch(){throw Error("database failed");}};
  await assert.rejects(saveQuoteDraft(db,selection,id),/database failed/);
});
