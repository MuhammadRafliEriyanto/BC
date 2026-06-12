import { NextRequest } from "next/server";

import { proxyProtectedBackend, readRequestBody } from "@/lib/backend-route";

type RouteParams = {
  params: Promise<{
    id: string;
  }>;
};

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const body = await readRequestBody(request);

  return proxyProtectedBackend(
    request,
    `/api/branches/admin-accounts/${encodeURIComponent(id)}`,
    {
      method: "PUT",
      body,
    },
  );
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  return proxyProtectedBackend(
    request,
    `/api/branches/admin-accounts/${encodeURIComponent(id)}`,
    {
      method: "DELETE",
    },
  );
}
