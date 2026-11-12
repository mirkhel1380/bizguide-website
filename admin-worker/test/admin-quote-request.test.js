import test from "node:test";
import assert from "node:assert/strict";
import { parseAdminQuoteRequest } from "../src/admin-quote-request.js";

const url = "https://admin.example.test/api/admin/quote-drafts";
const valid = {state:"WY",companyStatus:"not_formed",services:["llc_formation"]};
function req(data, opts={}) {
  return new Request(url,{method:"POST",headers:{
    "Content-Type":"application/json",Origin:"https://admin.example.test",...opts
  },body:typeof data==="string"?data:JSON.stringify(data)});
}
test("parses minimal valid staff selections",async()=>{
  assert.deepEqual((await parseAdminQuoteRequest(req(valid))).quote,valid);
});
test("rejects cross-site and missing Origin",async()=>{
  assert.equal((await parseAdminQuoteRequest(req(valid,{Origin:"https://evil.example"}))).status,403);
  assert.equal((await parseAdminQuoteRequest(req(valid,{Origin:""}))).status,403);
});
test("rejects oversized, invalid and sensitive payloads",async()=>{
  assert.equal((await parseAdminQuoteRequest(req("x".repeat(2200)))).status,413);
  assert.equal((await parseAdminQuoteRequest(req("{invalid"))).status,400);
  assert.equal((await parseAdminQuoteRequest(req({...valid,ssn:"sensitive"}))).status,400);
});
test("rejects non-JSON input",async()=>{
  assert.equal((await parseAdminQuoteRequest(req(valid,{"Content-Type":"text/plain"}))).status,415);
});
