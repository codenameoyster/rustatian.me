import { z } from 'zod';
import { WORKER_ERROR_CODES, type WorkerErrorCode } from './errorCodes';

// Exceeds the worker's own 8s upstream budget so the proxy leg gets to fail
// first and return a real error, rather than the UI aborting a live request.
const REQUEST_TIMEOUT_MS = 10_000;

const WorkerApiErrorSchema = z.object({
  error: z.object({
    code: z.enum(WORKER_ERROR_CODES),
    message: z.string(),
    upstreamStatus: z.number().optional(),
    requestId: z.string(),
  }),
});

export class WorkerApiError extends Error {
  readonly code: WorkerErrorCode;
  readonly status: number;
  readonly requestId: string;

  constructor(status: number, code: WorkerErrorCode, message: string, requestId: string) {
    super(message);
    this.status = status;
    this.code = code;
    this.requestId = requestId;
  }
}

export type NetworkErrorKind = 'timeout' | 'offline' | 'unknown';

// Raised when the browser never gets an HTTP response — timeout, DNS, offline,
// CORS preflight failure, etc. Distinct from `WorkerApiError` so the UI can
// show a connectivity-specific message instead of a generic "Failed to fetch".
export class NetworkError extends Error {
  readonly kind: NetworkErrorKind;

  constructor(kind: NetworkErrorKind, message?: string) {
    super(message ?? NetworkError.defaultMessage(kind));
    this.kind = kind;
  }

  static defaultMessage(kind: NetworkErrorKind): string {
    switch (kind) {
      case 'timeout':
        return 'Request timed out — check your connection';
      case 'offline':
        return 'Network unreachable — check your connection';
      case 'unknown':
        return 'Network error';
    }
  }
}

const mapApiError = async (response: Response): Promise<Error> => {
  const fallbackMessage = `GitHub API error: ${response.status}`;

  try {
    const payload: unknown = await response.json();
    const parsed = WorkerApiErrorSchema.safeParse(payload);

    if (!parsed.success) {
      console.warn('WorkerApiError schema mismatch', { issues: parsed.error, payload });
      return new Error(fallbackMessage);
    }

    const { code, message, requestId } = parsed.data.error;
    return new WorkerApiError(response.status, code, message, requestId);
  } catch (error) {
    console.warn('Failed to parse WorkerApiError body', error);
    return new Error(fallbackMessage);
  }
};

// Feature-detect so SSR / older test envs don't crash on missing
// `AbortSignal.timeout`. Modern browsers and Node 22+ support it natively.
const createTimeoutSignal = (): AbortSignal | undefined => {
  if (typeof AbortSignal !== 'undefined' && typeof AbortSignal.timeout === 'function') {
    return AbortSignal.timeout(REQUEST_TIMEOUT_MS);
  }
  return undefined;
};

const mapFetchFailure = (error: unknown): NetworkError => {
  if (error instanceof Error) {
    // `AbortSignal.timeout()` rejects with a DOMException-flavored TimeoutError.
    if (error.name === 'TimeoutError' || error.name === 'AbortError') {
      return new NetworkError('timeout');
    }
    // Browser `fetch` surfaces network-level failures (DNS, offline, CORS
    // preflight, connection reset) as TypeError.
    if (error instanceof TypeError) {
      return new NetworkError('offline');
    }
    return new NetworkError('unknown', error.message);
  }
  return new NetworkError('unknown', String(error));
};

export const fetchJson = async <T>(url: string, schema: z.ZodType<T>): Promise<T> => {
  const init: RequestInit = { headers: { Accept: 'application/json' } };
  const signal = createTimeoutSignal();
  if (signal) init.signal = signal;

  let response: Response;
  try {
    response = await fetch(url, init);
  } catch (error) {
    throw mapFetchFailure(error);
  }

  if (!response.ok) {
    throw await mapApiError(response);
  }

  let data: unknown;
  try {
    data = await response.json();
  } catch (error) {
    // The timeout signal also covers the body stream, so an expiry that lands
    // mid-read rejects here rather than at the fetch() call above.
    if (error instanceof Error && (error.name === 'TimeoutError' || error.name === 'AbortError')) {
      throw mapFetchFailure(error);
    }
    console.warn('Malformed JSON in API response', error);
    throw new Error('Received a malformed response from the server');
  }

  const parsed = schema.safeParse(data);
  if (!parsed.success) {
    // Zod stringifies every issue into `message`, which is kilobytes of JSON and
    // reaches the UI verbatim. Keep the detail in the console.
    console.warn('API response schema mismatch', { issues: parsed.error.issues, data });
    throw new Error('Received an unexpected response from the server');
  }

  return parsed.data;
};
