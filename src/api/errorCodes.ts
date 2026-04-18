// Codes emitted by the Cloudflare worker in the `WorkerApiErrorBody` envelope
// and consumed by the client to branch error handling (e.g. fall back to
// /repos when /pinned returns TOKEN_UNAVAILABLE). Keep the worker's string
// literals and the client's comparisons in sync through this one definition.
export const WORKER_ERROR_CODES = [
  'RATE_LIMITED',
  'METHOD_NOT_ALLOWED',
  'TOKEN_UNAVAILABLE',
  'UPSTREAM_ERROR',
  'UPSTREAM_GRAPHQL_ERROR',
  'NOT_FOUND',
  'INTERNAL_ERROR',
] as const;

export type WorkerErrorCode = (typeof WORKER_ERROR_CODES)[number];
