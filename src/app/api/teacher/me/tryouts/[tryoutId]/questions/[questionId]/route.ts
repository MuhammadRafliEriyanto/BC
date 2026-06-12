import { NextRequest } from "next/server";

import { proxyProtectedBackend, readRequestBody } from "@/lib/backend-route";

type RouteContext = {
  params: Promise<{
    tryoutId: string;
    questionId: string;
  }>;
};

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const { tryoutId, questionId } = await params;
  const body = await readRequestBody(request);

  return proxyProtectedBackend(
    request,
    `/api/teacher/me/tryouts/${encodeURIComponent(tryoutId)}/questions/${encodeURIComponent(questionId)}`,
    {
      method: "PATCH",
      body,
    },
  );
}

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  const { tryoutId, questionId } = await params;

  return proxyProtectedBackend(
    request,
    `/api/teacher/me/tryouts/${encodeURIComponent(tryoutId)}/questions/${encodeURIComponent(questionId)}`,
    {
      method: "DELETE",
    },
  );
}
