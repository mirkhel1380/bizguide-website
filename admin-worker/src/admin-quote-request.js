// Parse only authenticated staff quote drafts; no customer identity or money.
import { validateQuoteRequest } from "./quote-validation.js";

export async function parseAdminQuoteRequest(request) {
  if (request.headers.get("Content-Type")?.split(";")[0].trim().toLowerCase() !== "application/json") {
    return { error: "JSON required", status: 415 };
  }
  const origin = request.headers.get("Origin");
  if (!origin || origin !== new URL(request.url).origin) {
    return { error: "Same-origin request required", status: 403 };
  }
  const length = Number(request.headers.get("Content-Length") || "0");
  if (!Number.isFinite(length) || length < 0 || length > 2048) {
    return { error: "Request too large", status: 413 };
  }
  let raw;
  try { raw = await request.text(); }
  catch { return { error: "Invalid request body", status: 400 }; }
  if (raw.length > 2048) return { error: "Request too large", status: 413 };
  try { return { quote: validateQuoteRequest(JSON.parse(raw)) }; }
  catch { return { error: "Invalid quote selections", status: 400 }; }
}
