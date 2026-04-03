import { NextRequest } from "next/server";

interface RequestOptions {
  method?: string;
  headers?: Record<string, string>;
  cookies?: Record<string, string>;
  body?: unknown;
  searchParams?: Record<string, string>;
}

export function createTestRequest(
  path: string,
  options: RequestOptions = {},
): NextRequest {
  const { method = "GET", headers = {}, cookies = {}, body, searchParams = {} } = options;

  const url = new URL(path, "http://localhost:3000");
  for (const [key, value] of Object.entries(searchParams)) {
    url.searchParams.set(key, value);
  }

  const init: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  };

  if (body && method !== "GET") {
    init.body = JSON.stringify(body);
  }

  const request = new NextRequest(url, init);

  for (const [key, value] of Object.entries(cookies)) {
    request.cookies.set(key, value);
  }

  return request;
}

export async function parseJsonResponse<T = unknown>(
  response: Response,
): Promise<{ status: number; data: T }> {
  const data = (await response.json()) as T;
  return { status: response.status, data };
}
