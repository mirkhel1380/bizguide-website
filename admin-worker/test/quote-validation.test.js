import test from "node:test";
import assert from "node:assert/strict";
import { validateQuoteRequest } from "../src/quote-validation.js";
const valid = {state:"WY",companyStatus:"not_formed",services:["llc_formation","ein_without_ssn"]};

test("accepts a minimal non-sensitive quote request",()=>{
  assert.deepEqual(validateQuoteRequest(valid),valid);
});
test("rejects invalid state and company status",()=>{
  assert.throws(()=>validateQuoteRequest({...valid,state:"ZZ"}),TypeError);
  assert.throws(()=>validateQuoteRequest({...valid,companyStatus:"invalid"}),TypeError);
});
test("rejects unrecognized, duplicate and conflicting services",()=>{
  assert.throws(()=>validateQuoteRequest({...valid,services:["free_service"]}),TypeError);
  assert.throws(()=>validateQuoteRequest({...valid,services:["llc_formation","llc_formation"]}),TypeError);
  assert.throws(()=>validateQuoteRequest({...valid,services:["ein_with_ssn","ein_without_ssn"]}),TypeError);
});
test("rejects unexpected customer identity, tax number or price fields",()=>{
  for(const field of ["ssn","email","card","price","amount_cents","customerName"]){
    assert.throws(()=>validateQuoteRequest({...valid,[field]:"not allowed"}),TypeError);
  }
});
test("rejects empty request, empty services and non-object payloads",()=>{
  assert.throws(()=>validateQuoteRequest(null),TypeError);
  assert.throws(()=>validateQuoteRequest({...valid,services:[]}),TypeError);
  assert.throws(()=>validateQuoteRequest("text"),TypeError);
});
