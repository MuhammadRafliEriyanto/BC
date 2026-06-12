import { NextResponse } from "next/server";

const LANDING_CHATBOT_WEBHOOK_URL =
  "https://n8n.gitstraining.com/webhook/BimbelLMS";

const LANDING_CHATBOT_FALLBACK_TEXT =
  "Maaf, asisten sedang mengalami kendala. Silakan coba beberapa saat lagi.";

type LandingChatbotRequestBody = {
  message?: unknown;
  chatInput?: unknown;
};

type N8nResponse = {
  output?: unknown;
  text?: unknown;
  response?: unknown;
};

function normalizeText(value: unknown): string | null {
  if (typeof value !== "string") return null;

  const trimmedValue = value.trim();
  return trimmedValue ? trimmedValue : null;
}

function getRequestMessage(body: LandingChatbotRequestBody | null) {
  return normalizeText(body?.chatInput) ?? normalizeText(body?.message);
}

function getN8nReply(data: N8nResponse | null) {
  return (
    normalizeText(data?.output) ??
    normalizeText(data?.text) ??
    normalizeText(data?.response)
  );
}

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => null)) as
      | LandingChatbotRequestBody
      | null;

    const chatInput = getRequestMessage(body);

    if (!chatInput) {
      return NextResponse.json(
        { text: "Pesan chatbot tidak boleh kosong." },
        { status: 400 },
      );
    }

    const webhookResponse = await fetch(LANDING_CHATBOT_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ chatInput }),
      cache: "no-store",
    });

    const data = (await webhookResponse.json().catch(() => null)) as
      | N8nResponse
      | null;

    console.log("[landing-chatbot] n8n_response", {
      status: webhookResponse.status,
      ok: webhookResponse.ok,
      data,
    });

    if (!webhookResponse.ok) {
      return NextResponse.json({ text: LANDING_CHATBOT_FALLBACK_TEXT });
    }

    const replyText = getN8nReply(data);

    return NextResponse.json({
      text: replyText ?? LANDING_CHATBOT_FALLBACK_TEXT,
    });
  } catch (error) {
    console.error("[landing-chatbot] error", error);

    return NextResponse.json({
      text: LANDING_CHATBOT_FALLBACK_TEXT,
    });
  }
}