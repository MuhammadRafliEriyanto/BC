import { NextRequest } from "next/server";

import {
  proxyProtectedBackend,
  readRequestBody,
} from "@/lib/backend-route";

type RouteContext = {
  params: Promise<{
    tryoutId: string;
  }>;
};

export async function POST(request: NextRequest, context: RouteContext) {
  const { tryoutId } = await context.params;

  return proxyProtectedBackend(
    request,
    `/api/student/me/tryouts/${encodeURIComponent(tryoutId)}/submission`,
    {
      method: "POST",
      body: await readRequestBody(request),
    },
  );
}
