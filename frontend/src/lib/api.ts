export class ApiError extends Error {
  status: number;
  data: unknown;
  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

function getApiBase(): string {
  const explicit = (import.meta.env.VITE_API_URL as string | undefined)?.trim();
  if (explicit) return explicit.replace(/\/$/, '');
  return '';
}

async function request<T = unknown>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers || {});
  if (options.body && !(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  const url = path.startsWith('http') ? path : `${getApiBase()}${path}`;
  let res: Response;
  try {
    res = await fetch(url, {
      credentials: 'include',
      ...options,
      headers,
    });
  } catch (err) {
    const hint = getApiBase() ? ` (${getApiBase()})` : ' (is the API server running on port 5178?)';
    const message = err instanceof Error ? err.message : 'Failed to fetch';
    throw new ApiError(`${message}${hint}`, 0, null);
  }
  const isJson = (res.headers.get('content-type') || '').includes('application/json');
  const data: unknown = isJson ? await res.json().catch(() => null) : await res.text().catch(() => null);
  if (!res.ok) {
    const message =
      data && typeof data === 'object' && 'error' in data && typeof (data as { error: unknown }).error === 'string'
        ? (data as { error: string }).error
        : res.statusText || 'Request failed';
    throw new ApiError(message, res.status, data);
  }
  return data as T;
}

export const api = {
  get: <T = unknown>(path: string) => request<T>(path),
  post: <T = unknown>(path: string, body?: unknown) =>
    request<T>(path, { method: 'POST', body: body === undefined ? undefined : JSON.stringify(body) }),
  put: <T = unknown>(path: string, body?: unknown) =>
    request<T>(path, { method: 'PUT', body: body === undefined ? undefined : JSON.stringify(body) }),
  patch: <T = unknown>(path: string, body?: unknown) =>
    request<T>(path, { method: 'PATCH', body: body === undefined ? undefined : JSON.stringify(body) }),
  del: <T = unknown>(path: string) => request<T>(path, { method: 'DELETE' }),
};

export type ApiUser = {
  id: string;
  email: string;
  username: string | null;
  role: string;
  isAdmin: boolean;
};
