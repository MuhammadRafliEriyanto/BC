import { NextRequest } from "next/server";

import { proxyProtectedBackend, readRequestBody } from "@/lib/backend-route";

type BranchRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(request: NextRequest, context: BranchRouteContext) {
  const { id } = await context.params;

  return proxyProtectedBackend(request, `/api/branches/${encodeURIComponent(id)}`, {
    method: "GET",
  });
}

export async function PUT(request: NextRequest, context: BranchRouteContext) {
  const { id } = await context.params;
  const body = await readRequestBody(request);

  return proxyProtectedBackend(request, `/api/branches/${encodeURIComponent(id)}`, {
    method: "PUT",
    body,
  });
}

export async function DELETE(request: NextRequest, context: BranchRouteContext) {
  const { id } = await context.params;

  return proxyProtectedBackend(request, `/api/branches/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}
