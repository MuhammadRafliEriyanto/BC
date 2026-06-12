import type { ApiErrorDetails, ApiResponse } from "@/lib/auth";

export class AdminApiRequestError extends Error {
  status: number;
  errorCode?: string;
  errors?: ApiErrorDetails;

  constructor(
    message: string,
    status: number,
    errors?: ApiErrorDetails,
    errorCode?: string,
  ) {
    super(message);
    this.name = "AdminApiRequestError";
    this.status = status;
    this.errors = errors;
    this.errorCode = errorCode;
  }
}

export async function requestAdminApi<
  T extends Record<string, unknown> = Record<string, never>,
>(
  url: string,
  init: RequestInit = {},
): Promise<ApiResponse<T>> {
  const response = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
    credentials: "include",
    cache: "no-store",
  });
  const payload = (await response.json().catch(() => null)) as ApiResponse<T> | null;

  if (!response.ok || !payload?.success) {
    throw new AdminApiRequestError(
      payload?.message || "Terjadi kesalahan saat memproses permintaan admin.",
      response.status,
      payload?.errors,
      payload?.errorCode,
    );
  }

  return payload;
}

function parseContentDispositionFileName(value: string | null) {
  if (!value) {
    return null;
  }

  const utf8Match = value.match(/filename\*=UTF-8''([^;]+)/i);

  if (utf8Match?.[1]) {
    return decodeURIComponent(utf8Match[1]);
  }

  const basicMatch = value.match(/filename="?([^"]+)"?/i);
  return basicMatch?.[1] ?? null;
}

export async function requestAdminFile(
  url: string,
  init: RequestInit = {},
) {
  const response = await fetch(url, {
    ...init,
    credentials: "include",
    cache: "no-store",
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as ApiResponse | null;

    throw new AdminApiRequestError(
      payload?.message || "Terjadi kesalahan saat mengunduh file admin.",
      response.status,
      payload?.errors,
      payload?.errorCode,
    );
  }

  return {
    blob: await response.blob(),
    fileName: parseContentDispositionFileName(
      response.headers.get("content-disposition"),
    ),
  };
}

export async function downloadAdminFile(
  url: string,
  init: RequestInit = {},
) {
  const { blob, fileName } = await requestAdminFile(url, init);
  const nextFileName = fileName || `export-${new Date().toISOString().slice(0, 10)}.csv`;
  const downloadUrl = window.URL.createObjectURL(blob);
  const link = window.document.createElement("a");

  link.href = downloadUrl;
  link.download = nextFileName;
  window.document.body.appendChild(link);
  link.click();
  window.document.body.removeChild(link);
  window.URL.revokeObjectURL(downloadUrl);

  return nextFileName;
}
