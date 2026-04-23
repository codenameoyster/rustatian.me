// Error classes shared between `worker.ts` and the per-route modules it
// delegates to. Keeping them here avoids forward-reference gymnastics and
// lets route modules throw typed errors that the worker's catch block
// pattern-matches on.

// Why a reason discriminator: without it, JSON parse failures, Zod schema
// drift, and upstream HTTP errors all collapsed into the same log line, so
// a GitHub schema change looked identical to a 5xx and the engineer had no
// cue to update the Zod schema.
export type UpstreamFailureReason = 'http' | 'parse' | 'schema';

export class UpstreamRequestError extends Error {
  readonly status: number;
  readonly reason: UpstreamFailureReason;
  readonly issues: unknown;

  constructor(status: number, reason: UpstreamFailureReason = 'http', issues: unknown = undefined) {
    super(`Upstream request failed: ${status} (${reason})`);
    this.status = status;
    this.reason = reason;
    this.issues = issues;
  }
}

// Raised when the upstream returned HTTP 200 but the body contains an
// application-level error (e.g. GraphQL `errors[]`: bad credentials, missing
// scope, rate limit). Distinct from `UpstreamRequestError` so the downstream
// error response can describe the actual failure without falsely claiming a
// 5xx came from upstream.
export class GraphQLResponseError extends Error {
  readonly graphqlErrors: ReadonlyArray<{ message: string }>;

  constructor(graphqlErrors: ReadonlyArray<{ message: string }>) {
    const summary = graphqlErrors.map(e => e.message).join('; ') || 'unknown GraphQL error';
    super(`GitHub GraphQL returned an error: ${summary}`);
    this.graphqlErrors = graphqlErrors;
  }
}
