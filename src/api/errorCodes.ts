// Codes emitted by the Cloudflare worker in the `WorkerApiErrorBody` envelope.
// The runtime Zod enum (in fetchJson.ts) and the TS union below are both derived
// from this one tuple so worker emissions and client comparisons stay in sync.
//
// The worker's own 500 path returns text/plain rather than this envelope, so
// there is deliberately no INTERNAL_ERROR member — the client would never see it.
export const WORKER_ERROR_CODES = [
  'RATE_LIMITED',
  'METHOD_NOT_ALLOWED',
  'UPSTREAM_ERROR',
  'NOT_FOUND',
] as const;

export type WorkerErrorCode = (typeof WORKER_ERROR_CODES)[number];
