import "server-only";

type FallbackDetails = {
  error?: unknown;
  reason?: string;
};

type ErrorWithCode = {
  code?: unknown;
  name?: unknown;
};

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
