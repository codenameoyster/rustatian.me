import { z } from 'zod';
import { WORKER_ERROR_CODES, type WorkerErrorCode } from './errorCodes';

// Matches the worker's own upstream budget so a slow proxy leg doesn't leave
// the UI spinning forever. Set once here rather than inline at every call.
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

  const data: unknown = await response.json();
  return schema.parse(data);
};
