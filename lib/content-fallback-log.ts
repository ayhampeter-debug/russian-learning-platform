import "server-only";

type FallbackDetails = {
  error?: unknown;
  reason?: string;
};

type ErrorWithCode = {
  code?: unknown;
  name?: unknown;
};

export class ContentFallbackTimeoutError extends Error {
  constructor(label: string, timeoutMs: number) {
    super(`${label} timed out after ${timeoutMs}ms`);
    this.name = "ContentFallbackTimeoutError";
  }
}

export async function withContentFallbackTimeout<T>(
  promise: Promise<T>,
  label: string,
  timeoutMs = 3_500,
) {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  const timeout = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new ContentFallbackTimeoutError(label, timeoutMs));
    }, timeoutMs);
  });

  try {
    return await Promise.race([promise, timeout]);
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }
}

export function logContentFallback(message: string, details: FallbackDetails = {}) {
  if (process.env.NODE_ENV !== "development") {
    return;
  }

  const diagnostics = getSafeDiagnostics(details);

  if (diagnostics) {
    console.warn(`${message} ${diagnostics}`);
    return;
  }

  console.warn(message);
}

function getSafeDiagnostics({ error, reason }: FallbackDetails) {
  const parts: string[] = [];

  if (reason) {
    parts.push(`reason=${reason}`);
  }

  const safeError = getSafeErrorDetails(error);

  if (safeError.length > 0) {
    parts.push(...safeError);
  }

  return parts.length > 0 ? `(${parts.join(", ")})` : "";
}

function getSafeErrorDetails(error: unknown) {
  if (!error || typeof error !== "object") {
    return [];
  }

  const typedError = error as ErrorWithCode;
  const details: string[] = [];

  if (typeof typedError.name === "string") {
    details.push(`error=${typedError.name}`);
  }

  if (typeof typedError.code === "string") {
    details.push(`code=${typedError.code}`);
  }

  return details;
}
