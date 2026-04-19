import { z } from 'zod';
import { WORKER_ERROR_CODES, type WorkerErrorCode } from './errorCodes';

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

export const fetchJson = async <T>(url: string, schema: z.ZodType<T>): Promise<T> => {
  const response = await fetch(url, {
    headers: { Accept: 'application/json' },
  });

  if (!response.ok) {
    throw await mapApiError(response);
  }

  const data: unknown = await response.json();
  return schema.parse(data);
};
