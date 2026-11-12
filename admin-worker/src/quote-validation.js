// Quote request input validation only. NOT an order/payment endpoint.
const states = new Set(("AL AK AZ AR CA CO CT DE FL GA HI ID IL IN IA KS KY LA ME MD MA MI MN MS MO MT NE NV NH NJ NM NY NC ND OH OK OR PA RI SC SD TN TX UT VT VA WA WV WI WY DC").split(" "));
const services = new Set(["llc_formation","registered_agent","ein_with_ssn","ein_without_ssn"]);
const companyStatuses = new Set(["not_formed","formed","unsure"]);
export function validateQuoteRequest(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new TypeError("Invalid request");
  const keys = Object.keys(value);
  // Exclude names, emails, SSNs, addresses, payment info and arbitrary data from this phase.
  if (keys.some(k => !["state","services","companyStatus"].includes(k))) throw new TypeError("Unexpected field");
  const {state,services:items,companyStatus} = value;
  if (typeof state !== "string" || !states.has(state)) throw new TypeError("Invalid state");
  if (!companyStatuses.has(companyStatus)) throw new TypeError("Invalid company status");
  if (!Array.isArray(items) || items.length < 1 || items.length > 4 ||
      items.some(s => typeof s !== "string" || !services.has(s)) ||
      new Set(items).size !== items.length) throw new TypeError("Invalid services");
  if (items.includes("ein_with_ssn") && items.includes("ein_without_ssn")) throw new TypeError("Conflicting EIN options");
  // Never accept a price from the client. Recalculate any quote server-side later.
  return Object.freeze({state,companyStatus,services:Object.freeze([...items])});
}
