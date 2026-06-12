import { NextResponse, type NextRequest } from "next/server";

import { AUTH_TOKEN_COOKIE_NAME, type ApiResponse } from "@/lib/auth";

type BackendPayload = ApiResponse<Record<string, unknown>>;

function getBackendConfig() {
  const baseUrl = process.env.AUTH_API_URL?.trim();
  const apiKey = process.env.AUTH_API_KEY?.trim();

  if (!baseUrl) {
    throw new Error("AUTH_API_URL belum diatur pada .env.local root frontend.");
  }

  if (!apiKey) {
    throw new Error("AUTH_API_KEY belum diatur pada .env.local root frontend.");
  }

  return {
    baseUrl: baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl,
    apiKey,
  };
}

function buildAuthErrorResponse() {
  return NextResponse.json(
    {
      success: false,
      message: "Sesi login tidak ditemukan.",
    },
    {
      status: 401,
    },
  );
}

function buildPassthroughHeaders(response: Response) {
  const headers = new Headers();
  const contentType = response.headers.get("content-type");
  const contentDisposition = response.headers.get("content-disposition");
  const cacheControl = response.headers.get("cache-control");

  if (contentType) {
    headers.set("Content-Type", contentType);
  }

  if (contentDisposition) {
    headers.set("Content-Disposition", contentDisposition);
  }

  if (cacheControl) {
    headers.set("Cache-Control", cacheControl);
  }

  return headers;
}

export async function proxyPublicBackend(path: string, init: RequestInit = {}) {
  try {
    const { baseUrl, apiKey } = getBackendConfig();
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;
    const targetUrl = `${baseUrl}${normalizedPath}`;
    const headers = new Headers(init.headers);

    headers.set("x-api-key", apiKey);

    if (init.body && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }

    const response = await fetch(targetUrl, {
      ...init,
      headers,
      cache: "no-store",
    });
    const payload = (await response.json().catch(() => ({
      success: false,
      message: "Backend mengembalikan respons yang tidak valid.",
    }))) as BackendPayload;

    return NextResponse.json(payload, {
      status: response.status,
    });
  } catch (error) {
    const message =
      error instanceof Error && error.message
        ? error.message
        : "Gagal menghubungi backend.";

    return NextResponse.json(
      {
        success: false,
        message,
      },
      {
        status: 502,
      },
    );
  }
}

export async function proxyProtectedBackend(
  request: NextRequest,
  path: string,
  init: RequestInit = {},
) {
  const token = request.cookies.get(AUTH_TOKEN_COOKIE_NAME)?.value;

  if (!token) {
    return buildAuthErrorResponse();
  }

  try {
    const { baseUrl, apiKey } = getBackendConfig();
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;
    const targetUrl = `${baseUrl}${normalizedPath}`;
    const headers = new Headers(init.headers);

    headers.set("x-api-key", apiKey);
    headers.set("Authorization", `Bearer ${token}`);

    if (init.body && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }

    const response = await fetch(targetUrl, {
      ...init,
      headers,
      cache: "no-store",
    });
    const payload = (await response.json().catch(() => ({
      success: false,
      message: "Backend mengembalikan respons yang tidak valid.",
    }))) as BackendPayload;

    return NextResponse.json(payload, {
      status: response.status,
    });
  } catch (error) {
    const message =
      error instanceof Error && error.message
        ? error.message
        : "Gagal menghubungi backend.";

    return NextResponse.json(
      {
        success: false,
        message,
      },
      {
        status: 502,
      },
    );
  }
}

export async function proxyProtectedBackendRaw(
  request: NextRequest,
  path: string,
  init: RequestInit = {},
) {
  const token = request.cookies.get(AUTH_TOKEN_COOKIE_NAME)?.value;

  if (!token) {
    return buildAuthErrorResponse();
  }

  try {
    const { baseUrl, apiKey } = getBackendConfig();
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;
    const targetUrl = `${baseUrl}${normalizedPath}`;
    const headers = new Headers(init.headers);

    headers.set("x-api-key", apiKey);
    headers.set("Authorization", `Bearer ${token}`);

    if (init.body && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }

    const response = await fetch(targetUrl, {
      ...init,
      headers,
      cache: "no-store",
    });

    return new NextResponse(response.body, {
      status: response.status,
      headers: buildPassthroughHeaders(response),
    });
  } catch (error) {
    const message =
      error instanceof Error && error.message
        ? error.message
        : "Gagal menghubungi backend.";

    return NextResponse.json(
      {
        success: false,
        message,
      },
      {
        status: 502,
      },
    );
  }
}

export async function readRequestBody(request: NextRequest) {
  const bodyText = await request.text();

  return bodyText || undefined;
}
