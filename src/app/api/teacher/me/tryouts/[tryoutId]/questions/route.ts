import { NextRequest } from "next/server";

import { proxyProtectedBackend, readRequestBody } from "@/lib/backend-route";

type RouteContext = {
  params: Promise<{
    tryoutId: string;
  }>;
};

export async function GET(request: NextRequest, { params }: RouteContext) {
  const { tryoutId } = await params;

  return proxyProtectedBackend(
    request,
    `/api/teacher/me/tryouts/${encodeURIComponent(tryoutId)}/questions`,
    {
      method: "GET",
    },
  );
}

export async function POST(request: NextRequest, { params }: RouteContext) {
  const { tryoutId } = await params;
  const body = await readRequestBody(request);

  return proxyProtectedBackend(
    request,
    `/api/teacher/me/tryouts/${encodeURIComponent(tryoutId)}/questions`,
    {
      method: "POST",
      body,
    },
  );
}
