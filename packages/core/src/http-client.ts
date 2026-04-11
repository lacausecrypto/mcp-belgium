import { UpstreamApiError } from "./errors.js";
import { withRetry, type RetryOptions } from "./retry.js";
import { type TokenBucket } from "./rate-limiter.js";

export interface FetchOptions {
  method?: "GET" | "POST";
  params?: Record<string, string | number | boolean | undefined>;
  headers?: Record<string, string>;
  body?: string;
  rateLimiter?: TokenBucket;
  retry?: Partial<RetryOptions>;
  timeoutMs?: number;
}

export async function apiFetch<T>(
  source: string,
  baseUrl: string,
  path: string,
  opts: FetchOptions = {}
): Promise<T> {
  const { method = "GET", params, headers, body, rateLimiter, retry, timeoutMs = 10000 } = opts;

  if (rateLimiter) await rateLimiter.acquire();

  const normalizedBaseUrl = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  const normalizedPath = path.replace(/^\/+/, "");
  const url = new URL(normalizedPath, normalizedBaseUrl);
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined) url.searchParams.set(k, String(v));
    }
  }

  return withRetry(async () => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const res = await fetch(url.toString(), {
        method,
        headers: {
          Accept: "application/json",
          ...(body ? { "Content-Type": "application/json" } : {}),
          ...headers,
        },
        body,
        signal: controller.signal,
      });

      if (!res.ok) {
        const body = await res.text().catch(() => "");
        throw new UpstreamApiError(source, res.status, url.toString(), body);
      }

      return (await res.json()) as T;
    } finally {
      clearTimeout(timer);
    }
  }, retry);
}

export async function apiFetchText(
  source: string,
  baseUrl: string,
  path: string,
  opts: FetchOptions = {}
): Promise<string> {
  const { method = "GET", params, headers, body, rateLimiter, retry, timeoutMs = 10000 } = opts;

  if (rateLimiter) await rateLimiter.acquire();

  const normalizedBaseUrl = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  const normalizedPath = path.replace(/^\/+/, "");
  const url = new URL(normalizedPath, normalizedBaseUrl);
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined) url.searchParams.set(k, String(v));
    }
  }

  return withRetry(async () => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const res = await fetch(url.toString(), {
        method,
        headers: {
          Accept: "text/xml, text/plain, */*",
          ...(body ? { "Content-Type": "application/json" } : {}),
          ...headers,
        },
        body,
        signal: controller.signal,
      });

      if (!res.ok) {
        const responseBody = await res.text().catch(() => "");
        throw new UpstreamApiError(source, res.status, url.toString(), responseBody);
      }

      return await res.text();
    } finally {
      clearTimeout(timer);
    }
  }, retry);
}
