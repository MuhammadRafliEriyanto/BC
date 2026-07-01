import { validateEnv } from "../config/env";

const XENDIT_API_BASE_URL = "https://api.xendit.co";

export type XenditInvoiceStatus = "PENDING" | "PAID" | "SETTLED" | "EXPIRED";

export type XenditCustomer = {
  given_names: string;
  surname?: string;
  email: string;
  mobile_number?: string;
};

export type XenditInvoiceItem = {
  name: string;
  quantity: number;
  price: number;
  category?: string;
  url?: string;
};

export type XenditInvoiceCreatePayload = {
  external_id: string;
  amount: number;
  description?: string;
  payer_email?: string;
  customer?: XenditCustomer;
  customer_notification_preference?: {
    invoice_created?: string[];
    invoice_reminder?: string[];
    invoice_paid?: string[];
    invoice_expired?: string[];
  };
  success_redirect_url?: string;
  failure_redirect_url?: string;
  invoice_duration?: number;
  items?: XenditInvoiceItem[];
};

export type XenditInvoice = {
  id: string;
  external_id: string;
  user_id: string;
  status: XenditInvoiceStatus;
  merchant_name: string;
  merchant_profile_picture_url: string;
  amount: number;
  payer_email: string;
  description: string;
  invoice_url: string;
  expiry_date: string;
  created: string;
  updated: string;
  currency: string;
  customer?: XenditCustomer;
};

export type XenditInvoiceWebhookPayload = XenditInvoice;

type XenditApiErrorPayload = {
  message?: string;
  error_code?: string;
  errors?: unknown;
};

export class XenditServiceError extends Error {
  statusCode: number;
  errorCode: string | null;
  details: unknown;

  constructor(
    message: string,
    statusCode = 500,
    errorCode: string | null = null,
    details: unknown = null,
  ) {
    super(message);
    this.name = "XenditServiceError";
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.details = details;
  }
}

function getXenditConfig() {
  const { xenditApiKey, xenditWebhookToken } = validateEnv();

  return {
    apiKey: xenditApiKey,
    webhookToken: xenditWebhookToken,
  };
}

function buildBasicAuthHeader(apiKey: string) {
  return `Basic ${Buffer.from(`${apiKey}:`).toString("base64")}`;
}

function buildHeaders(apiKey: string, extraHeaders?: HeadersInit) {
  const headers = new Headers(extraHeaders);

  headers.set("Authorization", buildBasicAuthHeader(apiKey));
  headers.set("Accept", "application/json");

  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  return headers;
}

function resolveXenditErrorMessage(payload: XenditApiErrorPayload | null, fallbackMessage: string) {
  if (payload?.message && typeof payload.message === "string") {
    return payload.message;
  }

  return fallbackMessage;
}

async function requestXendit<T>(path: string, init: RequestInit): Promise<T> {
  const { apiKey } = getXenditConfig();

  if (!apiKey) {
    throw new XenditServiceError(
      "Xendit belum dikonfigurasi pada backend. Isi XENDIT_API_KEY terlebih dahulu.",
      500,
      "XENDIT_API_KEY_MISSING",
    );
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  let response: globalThis.Response;

  try {
    response = await fetch(`${XENDIT_API_BASE_URL}${normalizedPath}`, {
      ...init,
      headers: buildHeaders(apiKey, init.headers),
    });
  } catch (error) {
    throw new XenditServiceError(
      error instanceof Error
        ? `Gagal terhubung ke Xendit: ${error.message}`
        : "Gagal terhubung ke Xendit.",
      502,
      "XENDIT_NETWORK_ERROR",
    );
  }

  const payload = (await response.json().catch(() => null)) as T | XenditApiErrorPayload | null;

  if (!response.ok) {
    const errorPayload = payload as XenditApiErrorPayload | null;

    throw new XenditServiceError(
      resolveXenditErrorMessage(errorPayload, "Permintaan ke Xendit gagal diproses."),
      response.status,
      errorPayload?.error_code ?? null,
      errorPayload?.errors ?? errorPayload,
    );
  }

  return payload as T;
}

export function isHttpsUrl(value: string) {
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

export function verifyXenditWebhookToken(tokenHeader: string | undefined) {
  const { webhookToken } = getXenditConfig();

  if (!webhookToken) {
    throw new XenditServiceError(
      "Xendit webhook token belum dikonfigurasi pada backend.",
      500,
      "XENDIT_WEBHOOK_TOKEN_MISSING",
    );
  }

  if (!tokenHeader || tokenHeader !== webhookToken) {
    throw new XenditServiceError(
      "Webhook Xendit tidak valid.",
      401,
      "INVALID_XENDIT_WEBHOOK_TOKEN",
    );
  }
}

export function buildXenditReturnUrls(clientUrl: string, paymentId: string) {
  if (!isHttpsUrl(clientUrl)) {
    return {
      success_return_url: undefined,
      cancel_return_url: undefined,
    };
  }

  const normalizedClientUrl = clientUrl.endsWith("/") ? clientUrl.slice(0, -1) : clientUrl;

  return {
    success_return_url: `${normalizedClientUrl}/register-online/status?paymentId=${encodeURIComponent(paymentId)}`,
    cancel_return_url: `${normalizedClientUrl}/register-online/payment/${encodeURIComponent(paymentId)}`,
  };
}

export async function createXenditInvoice(payload: XenditInvoiceCreatePayload) {
  return requestXendit<XenditInvoice>("/v2/invoices", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getXenditInvoice(invoiceId: string) {
  return requestXendit<XenditInvoice>(
    `/v2/invoices/${encodeURIComponent(invoiceId)}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    },
  );
}

export async function expireXenditInvoice(invoiceId: string) {
  return requestXendit<XenditInvoice>(
    `/invoices/${encodeURIComponent(invoiceId)}/expire!`,
    {
      method: "POST",
      body: JSON.stringify({}),
    },
  );
}
