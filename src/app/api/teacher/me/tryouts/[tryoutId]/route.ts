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
    `/api/teacher/me/tryouts/${encodeURIComponent(tryoutId)}`,
    {
      method: "GET",
    },
  );
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const { tryoutId } = await params;
  const body = await readRequestBody(request);

  return proxyProtectedBackend(
    request,
    `/api/teacher/me/tryouts/${encodeURIComponent(tryoutId)}`,
    {
      method: "PATCH",
      body,
    },
  );
}

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  const { tryoutId } = await params;

  return proxyProtectedBackend(
    request,
    `/api/teacher/me/tryouts/${encodeURIComponent(tryoutId)}`,
    {
      method: "DELETE",
    },
  );
}
