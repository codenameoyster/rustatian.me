// Codes emitted by the Cloudflare worker in the `WorkerApiErrorBody` envelope.
// The runtime Zod enum (in githubRequests.ts) and the TS union below are both
// derived from this one tuple so worker emissions and client comparisons stay
// in sync.
export const WORKER_ERROR_CODES = [
  'RATE_LIMITED',
  'METHOD_NOT_ALLOWED',
  'UPSTREAM_ERROR',
  'NOT_FOUND',
  'INTERNAL_ERROR',
] as const;

export type WorkerErrorCode = (typeof WORKER_ERROR_CODES)[number];
