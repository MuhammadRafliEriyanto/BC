import { NextRequest } from "next/server";

import { proxyProtectedBackend } from "@/lib/backend-route";

type RouteContext = {
  params: Promise<{
    tryoutId: string;
  }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  const { tryoutId } = await context.params;

  return proxyProtectedBackend(
    request,
    `/api/student/me/tryouts/${encodeURIComponent(tryoutId)}`,
    {
      method: "GET",
    },
  );
}
